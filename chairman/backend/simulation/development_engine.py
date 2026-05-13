import random

def develop_player(player, club) -> None:
    """
    Handles weekly player development and decline.
    """
    # 1. GROWTH PHASE (age <= 26)
    if player.age <= 20:
        weekly_growth_cap = 0.8
    elif player.age <= 23:
        weekly_growth_cap = 0.5
    elif player.age <= 26:
        weekly_growth_cap = 0.2
    else:
        weekly_growth_cap = 0.0

    if weekly_growth_cap > 0 and player.overall_rating < player.potential_rating:
        # PROFESSIONALISM GATE
        # professionalism < 30: max growth = weeklyGrowthCap * 0.5
        # professionalism 30-60: max growth = weeklyGrowthCap * 0.8
        # professionalism 60-80: max growth = weeklyGrowthCap * 1.0
        # professionalism > 80: max growth = weeklyGrowthCap * 1.15
        prof = player.hidden_professionalism
        if prof < 30:
            growth_cap = weekly_growth_cap * 0.5
        elif prof <= 60:
            growth_cap = weekly_growth_cap * 0.8
        elif prof <= 80:
            growth_cap = weekly_growth_cap * 1.0
        else:
            growth_cap = weekly_growth_cap * 1.15

        # Modifiers
        # Training Level: level 5 = 1.5x
        facilities = getattr(club, 'facilities', None)
        training_level = getattr(facilities, 'training_level', 3) if facilities else 3
        training_mod = (training_level / 5) * 1.5

        # Morale: 0.5 to 1.5
        morale_mod = 0.5 + (player.morale / 100)

        # Playing time modifier based on recent form
        playing_time_mod = 1.2 if len(player.form) >= 3 else 0.7

        # Academy coach bonus for U21s
        academy_mod = 1.0
        if player.age <= 21 and club:
            academy_coach = club.staff.filter(role='ACADEMY_COACH').first()
            if academy_coach:
                academy_mod = 1.0 + (academy_coach.rating / 200)

        growth = growth_cap * training_mod * morale_mod * playing_time_mod * academy_mod
        growth = min(growth, growth_cap)  # cap at professionalism-gated max

        player.overall_rating = min(float(player.potential_rating), float(player.overall_rating) + growth)

        # Also grow individual attributes slightly
        training_focus = getattr(club, 'training_focus', 'BALANCED') if club else 'BALANCED'
        _grow_attributes(player, growth * 0.5, training_focus)

    # 2. DECLINE & VETERAN IMPROVEMENT (age >= 31)
    elif player.age >= 31:
        # PEAK LOCK check is implicitly handled because weekly_growth_cap is 0 for age > 26

        # Modeling the "wily veteran" effect: mental attributes improve by 0.3/week until age 36
        if player.age <= 36:
            player.ment_composure = min(99.0, float(player.ment_composure) + 0.3)
            player.ment_decisions = min(99.0, float(player.ment_decisions) + 0.3)
            player.ment_leadership = min(99.0, float(player.ment_leadership) + 0.3)

        # Physical decline
        decline_factor = min(1.0, (player.age - 30) / 10)

        # Physical attributes decline faster
        player.phys_pace = max(20, int(player.phys_pace * (1 - decline_factor * 0.008)))
        player.phys_acceleration = max(20, int(player.phys_acceleration * (1 - decline_factor * 0.008)))
        player.phys_stamina = max(25, int(player.phys_stamina * (1 - decline_factor * 0.006)))

        # Recalculate overall after attribute changes
        player.overall_rating = _calculate_overall(player)

    player.save(update_fields=[
        'overall_rating', 'phys_pace', 'phys_acceleration',
        'phys_stamina', 'ment_decisions', 'ment_composure',
        'ment_leadership', 'tech_passing', 'tech_shooting',
        'tech_dribbling', 'tech_tackling', 'tech_positioning',
        'tech_vision', 'tech_finishing', 'tech_handling',
        'tech_reflexes', 'tech_command_of_area'
    ])

def _grow_attributes(player, amount: float, training_focus: str = 'BALANCED') -> None:
    """
    Increments attributes relevant to player position and training focus.
    """
    # Base attributes to grow by position
    if player.position == 'GK':
        attrs = ['tech_handling', 'tech_reflexes', 'tech_command_of_area', 'phys_agility']
    elif player.position == 'DEF':
        attrs = ['tech_tackling', 'tech_positioning', 'phys_strength', 'ment_decisions']
    elif player.position == 'MID':
        attrs = ['tech_passing', 'tech_vision', 'tech_dribbling', 'ment_decisions']
    else: # ATT
        attrs = ['tech_finishing', 'tech_shooting', 'tech_dribbling', 'phys_pace']

    # Attribute groups for training focus
    focus_map = {
        'ATTACKING': ['tech_shooting', 'tech_finishing', 'tech_dribbling'],
        'DEFENSIVE': ['tech_tackling', 'tech_positioning', 'ment_decisions'],
        'PHYSICAL': ['phys_pace', 'phys_stamina', 'phys_strength'],
        'MENTAL': ['ment_composure', 'ment_leadership', 'ment_determination']
    }

    focus_attrs = focus_map.get(training_focus, [])

    # Combine and deduplicate
    all_attrs = list(set(attrs + focus_attrs))

    for attr in all_attrs:
        current = getattr(player, attr)
        if current < 99:
            # Apply training focus multiplier
            effective_amount = amount * 1.3 if attr in focus_attrs else amount

            # Growth is capped at potential rating (approximated for individual stats as 99)
            # Add a bit of randomness to which stat grows
            if random.random() < 0.7:
                if random.random() < effective_amount:
                     setattr(player, attr, min(99, current + 1))

def _calculate_overall(player) -> float:
    # Weight attributes by position
    if player.position == 'GK':
        weights = {'tech_handling': 0.20, 'tech_reflexes': 0.20,
                   'tech_command_of_area': 0.15, 'ment_composure': 0.15,
                   'phys_agility': 0.15, 'tech_positioning': 0.15}
    elif player.position == 'DEF':
        weights = {'tech_tackling': 0.20, 'tech_positioning': 0.18,
                   'phys_strength': 0.15, 'ment_decisions': 0.15,
                   'phys_pace': 0.12, 'tech_passing': 0.10, 'ment_composure': 0.10}
    elif player.position == 'MID':
        weights = {'tech_passing': 0.20, 'tech_vision': 0.18,
                   'phys_stamina': 0.15, 'ment_decisions': 0.15,
                   'tech_dribbling': 0.12, 'ment_work_rate': 0.10, 'tech_tackling': 0.10}
    else:  # ATT
        weights = {'tech_finishing': 0.22, 'tech_shooting': 0.18,
                   'phys_pace': 0.15, 'tech_dribbling': 0.15,
                   'ment_composure': 0.15, 'tech_positioning': 0.15}

    total = 0
    for attr, weight in weights.items():
        total += getattr(player, attr, 50) * weight

    return round(total, 2)
