/// TEFAMA AgentVault — policy core.
///
/// A user-owned Move policy object that grants allowlisted agents a *capped*
/// budget over a rolling window, with a hard grant expiry and owner revocation.
/// This module has NO external dependencies beyond the Sui framework, so it
/// compiles and unit-tests on its own. The DeepBook trade path lives in
/// `executor.move`, which calls `charge` here through package visibility.
///
/// Maps to the sub-track brief: "max N USDC, Deepbook only, expires 24h",
/// self-enforced ceiling, on-chain activity log, demonstrable revocation.
module tefama::vault {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::vec_set::{Self, VecSet};
    use sui::clock::{Self, Clock};
    use sui::event;

    // ===== Errors =====
    const ENotOwner: u64 = 0;
    const ENotAgent: u64 = 1;
    const EPaused: u64 = 2;
    const EOverBudget: u64 = 3;
    const EInsufficientBalance: u64 = 4;
    const EZeroAmount: u64 = 5;
    const EExpired: u64 = 6;
    const EWrongVault: u64 = 7;
    const ESlippage: u64 = 8;

    // ===== Objects =====

    /// Shared policy object. `Quote` is the spend asset (e.g. USDC), `Base` the
    /// acquired asset (e.g. SUI). Budget and `spent` are denominated in Quote.
    public struct Vault<phantom Quote, phantom Base> has key {
        id: UID,
        owner: address,
        quote: Balance<Quote>,
        base: Balance<Base>,
        agents: VecSet<address>,
        budget: u64,
        spent: u64,
        window_ms: u64,
        window_start_ms: u64,
        expires_at_ms: u64,
        paused: bool,
    }

    /// Owner authority. Holder of this cap controls the bound vault.
    public struct OwnerCap has key, store {
        id: UID,
        vault: ID,
    }

    /// Hot potato. No abilities, so it must be consumed by `settle_trade` in the
    /// same transaction. This forces the agent to return proceeds to the vault.
    public struct TradeReceipt<phantom Quote, phantom Base> {
        vault_id: ID,
        amount: u64,
        min_base_out: u64,
    }

    // ===== Events (the on-chain activity log) =====

    public struct VaultCreated has copy, drop {
        vault_id: ID,
        owner: address,
        budget: u64,
        window_ms: u64,
        expires_at_ms: u64,
    }

    public struct AgentAdded has copy, drop { vault_id: ID, agent: address }
    public struct AgentRemoved has copy, drop { vault_id: ID, agent: address }
    public struct BudgetUpdated has copy, drop { vault_id: ID, budget: u64 }
    public struct ExpiryUpdated has copy, drop { vault_id: ID, expires_at_ms: u64 }
    public struct PausedSet has copy, drop { vault_id: ID, paused: bool }
    public struct Charged has copy, drop {
        vault_id: ID,
        agent: address,
        amount: u64,
        spent_window_total: u64,
    }

    public struct TradeRequested has copy, drop {
        vault_id: ID,
        agent: address,
        amount: u64,
        min_base_out: u64,
    }

    public struct TradeSettled has copy, drop {
        vault_id: ID,
        quote_spent: u64,
        base_received: u64,
    }

    // ===== Create =====

    /// Create + share a vault, returning the OwnerCap for composability.
    /// `duration_ms` sets the grant lifetime (e.g. 24h). For a single lifetime
    /// budget cap, pass `window_ms == duration_ms`.
    public fun new<Quote, Base>(
        budget: u64,
        window_ms: u64,
        duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): OwnerCap {
        let now = clock::timestamp_ms(clock);
        let vault = Vault<Quote, Base> {
            id: object::new(ctx),
            owner: ctx.sender(),
            quote: balance::zero<Quote>(),
            base: balance::zero<Base>(),
            agents: vec_set::empty<address>(),
            budget,
            spent: 0,
            window_ms,
            window_start_ms: now,
            expires_at_ms: now + duration_ms,
            paused: false,
        };
        let vault_id = object::id(&vault);
        event::emit(VaultCreated {
            vault_id,
            owner: ctx.sender(),
            budget,
            window_ms,
            expires_at_ms: now + duration_ms,
        });
        transfer::share_object(vault);
        OwnerCap { id: object::new(ctx), vault: vault_id }
    }

    /// Entry wrapper: create a vault and send the cap to the caller.
    entry fun create<Quote, Base>(
        budget: u64,
        window_ms: u64,
        duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let cap = new<Quote, Base>(budget, window_ms, duration_ms, clock, ctx);
        transfer::public_transfer(cap, ctx.sender());
    }

    // ===== Funding =====

    public fun deposit_quote<Quote, Base>(vault: &mut Vault<Quote, Base>, c: Coin<Quote>) {
        balance::join(&mut vault.quote, coin::into_balance(c));
    }

    public fun deposit_base<Quote, Base>(vault: &mut Vault<Quote, Base>, c: Coin<Base>) {
        balance::join(&mut vault.base, coin::into_balance(c));
    }

    // ===== Owner controls (cap-gated) =====

    fun assert_owner<Quote, Base>(vault: &Vault<Quote, Base>, cap: &OwnerCap) {
        assert!(cap.vault == object::id(vault), ENotOwner);
    }

    public fun add_agent<Quote, Base>(vault: &mut Vault<Quote, Base>, cap: &OwnerCap, agent: address) {
        assert_owner(vault, cap);
        if (!vec_set::contains(&vault.agents, &agent)) vec_set::insert(&mut vault.agents, agent);
        event::emit(AgentAdded { vault_id: object::id(vault), agent });
    }

    /// Owner revocation. Removing the agent immediately blocks all future spends.
    public fun remove_agent<Quote, Base>(vault: &mut Vault<Quote, Base>, cap: &OwnerCap, agent: address) {
        assert_owner(vault, cap);
        if (vec_set::contains(&vault.agents, &agent)) vec_set::remove(&mut vault.agents, &agent);
        event::emit(AgentRemoved { vault_id: object::id(vault), agent });
    }

    public fun set_budget<Quote, Base>(vault: &mut Vault<Quote, Base>, cap: &OwnerCap, budget: u64) {
        assert_owner(vault, cap);
        vault.budget = budget;
        event::emit(BudgetUpdated { vault_id: object::id(vault), budget });
    }

    public fun set_window<Quote, Base>(vault: &mut Vault<Quote, Base>, cap: &OwnerCap, window_ms: u64) {
        assert_owner(vault, cap);
        vault.window_ms = window_ms;
    }

    public fun set_expiry<Quote, Base>(vault: &mut Vault<Quote, Base>, cap: &OwnerCap, expires_at_ms: u64) {
        assert_owner(vault, cap);
        vault.expires_at_ms = expires_at_ms;
        event::emit(ExpiryUpdated { vault_id: object::id(vault), expires_at_ms });
    }

    /// Kill switch. A second, instant revocation lever independent of the allowlist.
    public fun set_paused<Quote, Base>(vault: &mut Vault<Quote, Base>, cap: &OwnerCap, paused: bool) {
        assert_owner(vault, cap);
        vault.paused = paused;
        event::emit(PausedSet { vault_id: object::id(vault), paused });
    }

    public fun owner_withdraw_quote<Quote, Base>(
        vault: &mut Vault<Quote, Base>, cap: &OwnerCap, amount: u64, ctx: &mut TxContext,
    ): Coin<Quote> {
        assert_owner(vault, cap);
        assert!(balance::value(&vault.quote) >= amount, EInsufficientBalance);
        coin::take(&mut vault.quote, amount, ctx)
    }

    public fun owner_withdraw_base<Quote, Base>(
        vault: &mut Vault<Quote, Base>, cap: &OwnerCap, amount: u64, ctx: &mut TxContext,
    ): Coin<Base> {
        assert_owner(vault, cap);
        assert!(balance::value(&vault.base) >= amount, EInsufficientBalance);
        coin::take(&mut vault.base, amount, ctx)
    }

    // ===== Agent spend gate (called by executor.move) =====

    fun roll_window<Quote, Base>(vault: &mut Vault<Quote, Base>, now: u64) {
        if (now >= vault.window_start_ms + vault.window_ms) {
            vault.spent = 0;
            vault.window_start_ms = now;
        }
    }

    /// The whole policy: pause check, allowlist, expiry, window roll, cumulative
    /// ceiling, sufficient balance. On success, debits the budget and returns the
    /// Quote to spend. Package-visible so only TEFAMA's own executor can call it;
    /// the agent never receives a free coin from here.
    public(package) fun charge<Quote, Base>(
        vault: &mut Vault<Quote, Base>,
        amount: u64,
        clock: &Clock,
        ctx: &TxContext,
    ): Balance<Quote> {
        assert!(!vault.paused, EPaused);
        assert!(amount > 0, EZeroAmount);
        assert!(vec_set::contains(&vault.agents, &ctx.sender()), ENotAgent);
        let now = clock::timestamp_ms(clock);
        assert!(now <= vault.expires_at_ms, EExpired);
        roll_window(vault, now);
        assert!(vault.spent + amount <= vault.budget, EOverBudget);
        assert!(balance::value(&vault.quote) >= amount, EInsufficientBalance);
        vault.spent = vault.spent + amount;
        event::emit(Charged {
            vault_id: object::id(vault),
            agent: ctx.sender(),
            amount,
            spent_window_total: vault.spent,
        });
        balance::split(&mut vault.quote, amount)
    }

    /// Credit unspent Quote back and reduce the recorded spend (lot-size remainder).
    public(package) fun refund_quote<Quote, Base>(vault: &mut Vault<Quote, Base>, b: Balance<Quote>) {
        let v = balance::value(&b);
        if (v > 0 && vault.spent >= v) vault.spent = vault.spent - v;
        balance::join(&mut vault.quote, b);
    }

    /// Deposit acquired Base back into the vault.
    public(package) fun credit_base<Quote, Base>(vault: &mut Vault<Quote, Base>, b: Balance<Base>) {
        balance::join(&mut vault.base, b);
    }

    // ===== Agent trade path (composed with DeepBook in a PTB) =====

    /// Debit the budget and hand the agent the Quote to trade with, plus a hot
    /// potato that MUST be consumed by `settle_trade` in the same transaction.
    /// The agent composes a DeepBook swap between these two calls in one PTB.
    public fun request_trade<Quote, Base>(
        vault: &mut Vault<Quote, Base>,
        amount: u64,
        min_base_out: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ): (Coin<Quote>, TradeReceipt<Quote, Base>) {
        let bal = charge(vault, amount, clock, ctx);
        let c = coin::from_balance(bal, ctx);
        let vault_id = object::id(vault);
        event::emit(TradeRequested { vault_id, agent: ctx.sender(), amount, min_base_out });
        (c, TradeReceipt { vault_id, amount, min_base_out })
    }

    /// Consume the receipt, returning swap proceeds (`base`) and any unspent
    /// quote to the vault. Enforces the slippage floor and the vault binding.
    public fun settle_trade<Quote, Base>(
        vault: &mut Vault<Quote, Base>,
        receipt: TradeReceipt<Quote, Base>,
        base: Coin<Base>,
        quote_leftover: Coin<Quote>,
    ) {
        let TradeReceipt { vault_id, amount, min_base_out } = receipt;
        assert!(vault_id == object::id(vault), EWrongVault);
        let base_received = coin::value(&base);
        assert!(base_received >= min_base_out, ESlippage);
        let returned = coin::value(&quote_leftover);
        refund_quote(vault, coin::into_balance(quote_leftover));
        credit_base(vault, coin::into_balance(base));
        event::emit(TradeSettled {
            vault_id,
            quote_spent: amount - returned,
            base_received,
        });
    }

    // ===== Views =====

    public fun budget<Quote, Base>(v: &Vault<Quote, Base>): u64 { v.budget }
    public fun spent<Quote, Base>(v: &Vault<Quote, Base>): u64 { v.spent }
    public fun paused<Quote, Base>(v: &Vault<Quote, Base>): bool { v.paused }
    public fun owner<Quote, Base>(v: &Vault<Quote, Base>): address { v.owner }
    public fun expires_at_ms<Quote, Base>(v: &Vault<Quote, Base>): u64 { v.expires_at_ms }
    public fun quote_balance<Quote, Base>(v: &Vault<Quote, Base>): u64 { balance::value(&v.quote) }
    public fun base_balance<Quote, Base>(v: &Vault<Quote, Base>): u64 { balance::value(&v.base) }
    public fun is_agent<Quote, Base>(v: &Vault<Quote, Base>, a: address): bool {
        vec_set::contains(&v.agents, &a)
    }

    public fun remaining<Quote, Base>(v: &Vault<Quote, Base>, clock: &Clock): u64 {
        let now = clock::timestamp_ms(clock);
        if (now > v.expires_at_ms) { 0 }
        else if (now >= v.window_start_ms + v.window_ms) { v.budget }
        else { v.budget - v.spent }
    }

    // ===================================================================
    // Tests (DeepBook-free: they exercise the policy core via `charge`)
    // ===================================================================

    #[test_only] use sui::test_scenario as ts;
    #[test_only] public struct QUOTE has drop {}
    #[test_only] public struct BASE has drop {}
    #[test_only] const OWNER: address = @0xA;
    #[test_only] const AGENT: address = @0xB;
    #[test_only] const STRANGER: address = @0xC;
    #[test_only] const WINDOW: u64 = 3_600_000;   // 1h
    #[test_only] const DURATION: u64 = 86_400_000; // 24h

    #[test_only]
    fun setup(sc: &mut ts::Scenario, clock: &Clock) {
        {
            let cap = new<QUOTE, BASE>(1_000, WINDOW, DURATION, clock, ts::ctx(sc));
            transfer::public_transfer(cap, OWNER);
        };
        ts::next_tx(sc, OWNER);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(sc);
            let cap = ts::take_from_sender<OwnerCap>(sc);
            deposit_quote(&mut vault, coin::mint_for_testing<QUOTE>(2_000, ts::ctx(sc)));
            add_agent(&mut vault, &cap, AGENT);
            ts::return_to_sender(sc, cap);
            ts::return_shared(vault);
        };
    }

    #[test_only]
    fun spend(sc: &mut ts::Scenario, clock: &Clock, who: address, amount: u64): u64 {
        ts::next_tx(sc, who);
        let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(sc);
        let b = charge(&mut vault, amount, clock, ts::ctx(sc));
        balance::destroy_for_testing(b);
        let total = spent(&vault);
        ts::return_shared(vault);
        total
    }

    #[test]
    fun charge_happy_path() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        assert!(spend(&mut sc, &clock, AGENT, 600) == 600, 0);
        assert!(spend(&mut sc, &clock, AGENT, 300) == 900, 1);
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = EOverBudget)]
    fun rejects_over_budget() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        spend(&mut sc, &clock, AGENT, 1_001);
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = EOverBudget)]
    fun rejects_cumulative_fragmentation() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        spend(&mut sc, &clock, AGENT, 700);
        spend(&mut sc, &clock, AGENT, 400); // 1100 > 1000
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    fun window_resets_spent() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        assert!(spend(&mut sc, &clock, AGENT, 900) == 900, 0);
        clock::increment_for_testing(&mut clock, WINDOW + 1);
        assert!(spend(&mut sc, &clock, AGENT, 900) == 900, 1); // reset then 900
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = EExpired)]
    fun rejects_after_expiry() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        clock::increment_for_testing(&mut clock, DURATION + 1);
        spend(&mut sc, &clock, AGENT, 10);
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = ENotAgent)]
    fun rejects_non_agent() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        spend(&mut sc, &clock, STRANGER, 10);
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = ENotAgent)]
    fun revocation_blocks_agent() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        assert!(spend(&mut sc, &clock, AGENT, 100) == 100, 0);
        // owner revokes
        ts::next_tx(&mut sc, OWNER);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            let cap = ts::take_from_sender<OwnerCap>(&sc);
            remove_agent(&mut vault, &cap, AGENT);
            ts::return_to_sender(&sc, cap);
            ts::return_shared(vault);
        };
        spend(&mut sc, &clock, AGENT, 100); // now aborts ENotAgent
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = EPaused)]
    fun pause_blocks_agent() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        ts::next_tx(&mut sc, OWNER);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            let cap = ts::take_from_sender<OwnerCap>(&sc);
            set_paused(&mut vault, &cap, true);
            ts::return_to_sender(&sc, cap);
            ts::return_shared(vault);
        };
        spend(&mut sc, &clock, AGENT, 10);
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    fun owner_can_withdraw() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        ts::next_tx(&mut sc, OWNER);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            let cap = ts::take_from_sender<OwnerCap>(&sc);
            let out = owner_withdraw_quote(&mut vault, &cap, 500, ts::ctx(&mut sc));
            assert!(coin::value(&out) == 500, 0);
            assert!(quote_balance(&vault) == 1_500, 1);
            coin::burn_for_testing(out);
            ts::return_to_sender(&sc, cap);
            ts::return_shared(vault);
        };
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    // ----- executor settlement helpers (exercised in sui move test) -----

    #[test]
    fun credit_base_deposits() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        ts::next_tx(&mut sc, AGENT);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            credit_base(&mut vault, balance::create_for_testing<BASE>(777));
            assert!(base_balance(&vault) == 777, 0);
            ts::return_shared(vault);
        };
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    fun refund_quote_corrects_spent() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        // agent charges 600 -> spent 600, quote 1400
        assert!(spend(&mut sc, &clock, AGENT, 600) == 600, 0);
        // settle 100 of unspent quote back
        ts::next_tx(&mut sc, AGENT);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            refund_quote(&mut vault, balance::create_for_testing<QUOTE>(100));
            assert!(spent(&vault) == 500, 1);
            assert!(quote_balance(&vault) == 1_500, 2); // 2000 - 600 + 100
            ts::return_shared(vault);
        };
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    fun trade_request_and_settle() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        ts::next_tx(&mut sc, AGENT);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            // agent requests 600 of quote to trade with
            let (cq, receipt) = request_trade(&mut vault, 600, 1, &clock, ts::ctx(&mut sc));
            assert!(coin::value(&cq) == 600, 0);
            assert!(spent(&vault) == 600, 1);
            // simulate a DeepBook swap: 600 quote -> 590 base, 50 quote unspent
            coin::burn_for_testing(cq);
            let base = coin::mint_for_testing<BASE>(590, ts::ctx(&mut sc));
            let qleft = coin::mint_for_testing<QUOTE>(50, ts::ctx(&mut sc));
            settle_trade(&mut vault, receipt, base, qleft);
            assert!(base_balance(&vault) == 590, 2);
            assert!(spent(&vault) == 550, 3);          // 600 - 50 refunded
            assert!(quote_balance(&vault) == 1_450, 4); // 2000 - 600 + 50
            ts::return_shared(vault);
        };
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = ESlippage)]
    fun trade_settle_rejects_slippage() {
        let mut sc = ts::begin(OWNER);
        let mut clock = clock::create_for_testing(ts::ctx(&mut sc));
        clock::set_for_testing(&mut clock, 1_000);
        setup(&mut sc, &clock);
        ts::next_tx(&mut sc, AGENT);
        {
            let mut vault = ts::take_shared<Vault<QUOTE, BASE>>(&sc);
            // demand at least 500 base out
            let (cq, receipt) = request_trade(&mut vault, 600, 500, &clock, ts::ctx(&mut sc));
            coin::burn_for_testing(cq);
            // settle with only 100 base -> ESlippage
            let base = coin::mint_for_testing<BASE>(100, ts::ctx(&mut sc));
            let qleft = coin::mint_for_testing<QUOTE>(0, ts::ctx(&mut sc));
            settle_trade(&mut vault, receipt, base, qleft);
            ts::return_shared(vault);
        };
        clock::destroy_for_testing(clock);
        ts::end(sc);
    }
}
