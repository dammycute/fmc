import random

def develop_player(player, club) -> None:
    """
    Handles weekly player development and decline.
    """
    changed_fields = set()

    # Problem 4: Injury recovery does not restore fitness gradually.
    # If a player is no longer injured but fitness is below 100, restore it by 8.0 per week.
    # This applies to ALL players regardless of age or potential.
    if not player.is_injured and player.fitness < 100.0:
        player.fitness = min(100.0, float(player.fitness) + 8.0)
        changed_fields.add('fitness')

    # Problem 3: Youth development applies to all ages.
    # Skip players whose potential is already achieved, unless they are young enough to still have variance,
    # or old enough to be in the decline phase.
    if player.overall_rating >= player.potential_rating and player.age > 22:
        if player.age < 31:
            if changed_fields:
                player.save(update_fields=list(changed_fields))
            return

    # GROWTH PHASE (age <= 26)
    weekly_growth_cap = 0.0
    if 16 <= player.age <= 20:
        weekly_growth_cap = 0.8
    elif 21 <= player.age <= 23:
        weekly_growth_cap = 0.5
    elif 24 <= player.age <= 26:
        weekly_growth_cap = 0.2

    # PROFESSIONALISM GATE
    prof = player.hidden_professionalism
    growth_gate = 0.0
    if prof < 30:
        growth_gate = weekly_growth_cap * 0.5
    elif 30 <= prof <= 60:
        growth_gate = weekly_growth_cap * 0.8
    elif 60 < prof <= 80:
        growth_gate = weekly_growth_cap * 1.0
    else: # > 80
        growth_gate = weekly_growth_cap * 1.15

    # MODIFIERS (all multiplicative)
    # Training level: (training_level / 5) * 1.5
    facilities = getattr(club, 'facilities', None)
    training_level = getattr(facilities, 'training_level', 3) if facilities else 3
    training_mod = (training_level / 5) * 1.5

    # Morale: 0.5 + (morale / 100)
    morale_mod = 0.5 + (player.morale / 100)

    # Playing time: 1.2 if player has 3+ recent form entries, else 0.7
    playing_time_mod = 1.2 if len(player.form) >= 3 else 0.7

    # Academy coach bonus for U21: 1.0 + (academy_coach.rating / 200) if coach exists
    academy_mod = 1.0
    if player.age <= 21 and club:
        academy_coach = club.staff.filter(role='ACADEMY_COACH').first()
        if academy_coach:
            academy_mod = 1.0 + (academy_coach.rating / 200)

    effective_amount = growth_gate * training_mod * morale_mod * playing_time_mod * academy_mod

    # ATTRIBUTE GROWTH
    if effective_amount > 0:
        training_focus = getattr(club, 'training_focus', 'BALANCED') if club else 'BALANCED'

        # Attribute groups for training focus
        focus_map = {
            'ATTACKING': ['tech_shooting', 'tech_finishing', 'tech_dribbling'],
            'DEFENSIVE': ['tech_tackling', 'tech_positioning', 'ment_decisions'],
            'PHYSICAL': ['phys_pace', 'phys_stamina', 'phys_strength'],
            'MENTAL': ['ment_composure', 'ment_leadership', 'ment_determination']
        }

        target_attrs = focus_map.get(training_focus, [])
        for attr in target_attrs:
            current_val = getattr(player, attr)
            if current_val < 99:
                # Each attribute has 70% chance to grow by 1 point if random roll < effective_amount
                if random.random() < 0.7:
                    if random.random() < effective_amount:
                        setattr(player, attr, current_val + 1)
                        changed_fields.add(attr)

    # DECLINE PHASE (age >= 31)
    if player.age >= 31:
        decline_factor = min(1.0, (player.age - 30) / 10)

        # phys_pace: * (1 - decline_factor * 0.008) per week
        # phys_acceleration: same
        # phys_stamina: * (1 - decline_factor * 0.006) per week

        old_pace = player.phys_pace
        player.phys_pace = float(player.phys_pace) * (1 - decline_factor * 0.008)
        if player.phys_pace != old_pace:
            changed_fields.add('phys_pace')

        old_accel = player.phys_acceleration
        player.phys_acceleration = float(player.phys_acceleration) * (1 - decline_factor * 0.008)
        if player.phys_acceleration != old_accel:
            changed_fields.add('phys_acceleration')

        old_stamina = player.phys_stamina
        player.phys_stamina = float(player.phys_stamina) * (1 - decline_factor * 0.006)
        if player.phys_stamina != old_stamina:
            changed_fields.add('phys_stamina')

        # Mental attributes IMPROVE for age 31-36: composure +0.3/week, decisions +0.3/week
        if player.age <= 36:
            old_comp = player.ment_composure
            player.ment_composure = min(99.0, float(player.ment_composure) + 0.3)
            if player.ment_composure != old_comp:
                changed_fields.add('ment_composure')

            old_dec = player.ment_decisions
            player.ment_decisions = min(99.0, float(player.ment_decisions) + 0.3)
            if player.ment_decisions != old_dec:
                changed_fields.add('ment_decisions')

    # Problems 1 & 2: Recalculate overall unconditionally and enforce potential ceiling.
    new_overall = _calculate_overall(player)
    if new_overall > player.potential_rating:
        new_overall = float(player.potential_rating)

    if new_overall != player.overall_rating:
        player.overall_rating = new_overall
        changed_fields.add('overall_rating')

    if changed_fields:
        player.save(update_fields=list(changed_fields))

def recalculate_player_for_position(player, new_position: str) -> None:
    """
    Adjusts attributes slightly when a player changes position.
    """
    if player.position == new_position:
        return

    player.position = new_position

    # Randomly adjust relevant attributes by -2 to +2 to simulate adaptation
    # (Simplified: in a real game we'd target specific stat groups)
    attrs_to_jitter = [
        'tech_passing', 'tech_shooting', 'tech_dribbling', 'tech_tackling',
        'tech_positioning', 'tech_vision', 'tech_finishing', 'phys_pace',
        'phys_strength', 'phys_stamina', 'phys_agility', 'phys_acceleration'
    ]

    for attr in attrs_to_jitter:
        val = getattr(player, attr)
        jitter = random.randint(-2, 2)
        setattr(player, attr, max(1, min(99, val + jitter)))

    player.overall_rating = _calculate_overall(player)
    player.save(update_fields=attrs_to_jitter + ['position', 'overall_rating'])

def _calculate_overall(player) -> float:
    # GK weights: handling 0.20, reflexes 0.20, command_of_area 0.15, composure 0.15, agility 0.15, positioning 0.15
    # DEF weights: tackling 0.20, positioning 0.18, strength 0.15, decisions 0.15, pace 0.12, passing 0.10, composure 0.10
    # MID weights: passing 0.20, vision 0.18, stamina 0.15, decisions 0.15, dribbling 0.12, work_rate 0.10, tackling 0.10
    # ATT weights: finishing 0.22, shooting 0.18, pace 0.15, dribbling 0.15, composure 0.15, positioning 0.15

    if player.position == 'GK':
        weights = {
            'tech_handling': 0.20, 'tech_reflexes': 0.20,
            'tech_command_of_area': 0.15, 'ment_composure': 0.15,
            'phys_agility': 0.15, 'tech_positioning': 0.15
        }
    elif player.position == 'DEF':
        weights = {
            'tech_tackling': 0.20, 'tech_positioning': 0.18,
            'phys_strength': 0.15, 'ment_decisions': 0.15,
            'phys_pace': 0.12, 'tech_passing': 0.10, 'ment_composure': 0.10
        }
    elif player.position == 'MID':
        weights = {
            'tech_passing': 0.20, 'tech_vision': 0.18,
            'phys_stamina': 0.15, 'ment_decisions': 0.15,
            'tech_dribbling': 0.12, 'ment_work_rate': 0.10, 'tech_tackling': 0.10
        }
    else:  # ATT
        weights = {
            'tech_finishing': 0.22, 'tech_shooting': 0.18,
            'phys_pace': 0.15, 'tech_dribbling': 0.15,
            'ment_composure': 0.15, 'tech_positioning': 0.15
        }

    total = 0
    for attr, weight in weights.items():
        val = getattr(player, attr, 50)
        total += float(val) * weight

    return round(total, 2)
