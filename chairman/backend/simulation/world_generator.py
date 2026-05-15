import random
import json
from django.db import transaction
from game.models import (
    League, Club, ClubFacilities, Player, Manager, Staff,
    Sponsor, GameState, Position, Formation, TacticalPhilosophy,
    SeasonTarget, OwnershipType, StaffRole, TransferStatus
)

# ── DATA CONSTANTS ───────────────────────────────────

FIRST_NAMES = [
    'John', 'David', 'Michael', 'Chris', 'James', 'Robert', 'Mark', 'Paul', 'Kevin', 'Steven',
    'Thomas', 'Daniel', 'Gary', 'William', 'Richard', 'Joseph', 'Andrew', 'Ryan', 'Luke', 'Adam',
    'Mateo', 'Luka', 'Santi', 'Theo', 'Marco', 'Kasper', 'Sven', 'Hiroshi', 'Alessandro', 'Oliver',
    'Noah', 'Liam', 'Lucas', 'Mason', 'Ethan', 'Logan', 'Aiden', 'Arlo', 'Finn', 'Hugo'
]
LAST_NAMES = [
    'Smith', 'Jones', 'Brown', 'Taylor', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson',
    'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Harris', 'Clarke',
    'Garcia', 'Muller', 'Silva', 'Rossi', 'Dubois', 'Fisher', 'Mason', 'Knight', 'Butler', 'Cole',
    'West', 'Jordan', 'Banks', 'Lane', 'Ford', 'Rice', 'Hunt', 'Shaw', 'Hart', 'Webb', 'Bell'
]

ENGLISH_FIRST = ['Jack', 'Harry', 'George', 'Charlie', 'Alfie', 'James', 'Oliver', 'Liam', 'Mason', 'Theo', 'Connor', 'Kieran', 'Luke', 'Ryan', 'Jordan', 'Adam', 'Lewis', 'Callum', 'Ben', 'Tom']
ENGLISH_LAST = ['Smith', 'Jones', 'Taylor', 'Brown', 'Wilson', 'Davies', 'Evans', 'Thomas', 'Roberts', 'Walker', 'White', 'Hall', 'Clarke', 'Ward', 'Moore', 'Hughes', 'Martin', 'Wood', 'Lewis', 'Lee']
FRENCH_FIRST = ['Kylian', 'Antoine', 'Karim', 'Paul', 'Raphael', 'Theo', 'Ousmane', 'Marcus', 'Kingsley', 'Lucas', 'Matteo', 'Rayan', 'Youssef', 'Axel', 'Amine', 'Florian', 'Nabil', 'Adrien', 'Tanguy']
FRENCH_LAST = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Laurent', 'Leroy', 'Moreau', 'Girard', 'Rousseau', 'Blanc', 'Lemaire', 'Faure', 'Dembele', 'Kante', 'Pogba', 'Mbappe', 'Zidane', 'Henry', 'Vieira']
SPANISH_FIRST = ['Pablo', 'Carlos', 'Diego', 'Sergio', 'Alejandro', 'Fernando', 'Alvaro', 'Marcos', 'Rodrigo', 'Mikel', 'Dani', 'Pedri', 'Gavi', 'Ferran', 'Nico', 'Eric', 'Oscar', 'Victor', 'Ivan', 'Luis']
SPANISH_LAST = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Sanchez', 'Gonzalez', 'Perez', 'Torres', 'Ramirez', 'Flores', 'Morales', 'Ortega', 'Silva', 'Diaz', 'Romero', 'Ruiz', 'Jimenez', 'Alvarez', 'Molina']
BRAZILIAN_FIRST = ['Gabriel', 'Vinicius', 'Rodrygo', 'Endrick', 'Matheus', 'Lucas', 'Felipe', 'Rafael', 'Bruno', 'Thiago', 'Neymar', 'Richarlison', 'Casemiro', 'Fabinho', 'Roberto', 'Alisson', 'Ederson', 'Marquinhos']
BRAZILIAN_LAST = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Barbosa', 'Cavalcanti', 'Nunes', 'Araujo', 'Mendes', 'Teixeira']
AFRICAN_FIRST = ['Mohamed', 'Sadio', 'Riyad', 'Victor', 'Emmanuel', 'Wilfried', 'Nicolas', 'Divock', 'Odion', 'Samuel', 'Ismaila', 'Serge', 'Andre', 'Thomas', 'Ibrahim', 'Cheikhou', 'Edouard', 'Bukayo', 'Eberechi']
AFRICAN_LAST = ['Salah', 'Mane', 'Mahrez', 'Osimhen', 'Zaha', 'Boly', 'Onana', 'Eze', 'Saka', 'Diallo', 'Kouyate', 'Traore', 'Doucouré', 'Bakayoko', 'Koulibaly', 'Mendy', 'Sarr', 'Diatta']
GERMAN_FIRST = ['Thomas', 'Kai', 'Leroy', 'Joshua', 'Leon', 'Florian', 'Marco', 'Toni', 'Manuel', 'Niklas', 'Antonio', 'Serge', 'Ilkay', 'Julian', 'Lukas', 'Jonas', 'Max', 'Robin', 'Emre']
GERMAN_LAST = ['Muller', 'Kroos', 'Reus', 'Werner', 'Sane', 'Kimmich', 'Goretzka', 'Musiala', 'Gnabry', 'Rudiger', 'Havertz', 'Neuer', 'Hummels', 'Boateng', 'Gundogan', 'Draxler', 'Brandt']
SCANDINAVIAN_FIRST = ['Erling', 'Martin', 'Kasper', 'Christian', 'Mikkel', 'Victor', 'Andreas', 'Joachim', 'Emil', 'Rasmus', 'Magnus', 'Fredrik', 'Sander', 'Jonas', 'Mathias', 'Henrik', 'Lars', 'Bjorn', 'Erik']
SCANDINAVIAN_LAST = ['Haaland', 'Odegaard', 'Schmeichel', 'Eriksen', 'Damsgaard', 'Skov Olsen', 'Lindstrom', 'Norgaard', 'Braithwaite', 'Forsberg', 'Larsson', 'Berg', 'Johnsen', 'Hansen', 'Nielsen', 'Andersen']

ASIAN_FIRST = ['Hiroshi', 'Kenji', 'Takashi', 'Min-jun', 'Ji-hoon', 'Wei', 'Li', 'Hao', 'Sunil', 'Arjun', 'Sanjay', 'Yoshi', 'Akira', 'Yuki', 'Binh', 'Duc', 'Ravi', 'Anil']
ASIAN_LAST = ['Tanaka', 'Sato', 'Suzuki', 'Kim', 'Lee', 'Park', 'Wang', 'Zhang', 'Chen', 'Singh', 'Sharma', 'Patel', 'Nguyen', 'Tran', 'Le', 'Wong', 'Lin', 'Liu']

NORTH_AMERICAN_FIRST = ['Christian', 'Weston', 'Tyler', 'Brenden', 'Sergino', 'Alphonso', 'Jonathan', 'Cyle', 'Tajon', 'Landon', 'Clint', 'Tim', 'Miles', 'Walker', 'Antonee']
NORTH_AMERICAN_LAST = ['Pulisic', 'McKennie', 'Adams', 'Aaronson', 'Dest', 'Davies', 'David', 'Larin', 'Buchanan', 'Donovan', 'Dempsey', 'Howard', 'Robinson', 'Zimmerman', 'Robinson']

TIER_RATINGS = {
    1: {'min': 76, 'max': 94, 'variance': 5},
    2: {'min': 63, 'max': 78, 'variance': 7},
    3: {'min': 52, 'max': 67, 'variance': 9},
    4: {'min': 42, 'max': 57, 'variance': 11},
    5: {'min': 32, 'max': 48, 'variance': 13},
}

PLAYER_ARCHETYPES = {
    'GK': [
        {'name': 'Sweeper Keeper', 'statBias': {'tech_rushing_out': 12, 'tech_reflexes': 8, 'tech_command_of_area': -5, 'tech_handling': -3, 'tech_passing': 6}},
        {'name': 'Traditional Keeper', 'statBias': {'tech_command_of_area': 12, 'tech_handling': 10, 'tech_rushing_out': -8, 'tech_reflexes': 5, 'tech_passing': -5}},
        {'name': 'Distributor', 'statBias': {'tech_passing': 14, 'tech_handling': 8, 'tech_reflexes': -3, 'tech_rushing_out': 5, 'tech_command_of_area': -4}},
    ],
    'DEF': [
        {'name': 'Ball Playing CB', 'statBias': {'tech_passing': 10, 'tech_vision': 8, 'tech_tackling': -3, 'phys_pace': -4, 'phys_strength': -2}},
        {'name': 'Stopper', 'statBias': {'tech_tackling': 12, 'phys_strength': 10, 'ment_aggression': 8, 'tech_passing': -8, 'phys_pace': -5}},
        {'name': 'Pacey CB', 'statBias': {'phys_pace': 12, 'phys_acceleration': 10, 'tech_tackling': 4, 'phys_strength': -6, 'tech_passing': -4}},
        {'name': 'Fullback Winger', 'statBias': {'phys_pace': 10, 'tech_dribbling': 8, 'tech_vision': 6, 'tech_tackling': -4, 'phys_strength': -5}},
        {'name': 'Defensive Fullback', 'statBias': {'tech_tackling': 10, 'tech_positioning': 8, 'phys_pace': -3, 'tech_dribbling': -6}},
    ],
    'MID': [
        {'name': 'Deep Lying Playmaker', 'statBias': {'tech_passing': 14, 'tech_vision': 12, 'tech_tackling': 4, 'phys_pace': -6, 'tech_shooting': -5}},
        {'name': 'Box to Box', 'statBias': {'ment_work_rate': 10, 'phys_stamina': 8, 'tech_shooting': 6, 'tech_passing': 4, 'phys_pace': 4}},
        {'name': 'Destroyer CDM', 'statBias': {'tech_tackling': 14, 'ment_aggression': 10, 'phys_strength': 8, 'tech_passing': -10, 'tech_vision': -8}},
        {'name': 'Advanced Playmaker', 'statBias': {'tech_vision': 12, 'tech_dribbling': 10, 'tech_passing': 8, 'tech_shooting': 4, 'tech_tackling': -8}},
        {'name': 'Wide Midfielder', 'statBias': {'phys_pace': 8, 'tech_vision': 6, 'tech_dribbling': 6, 'phys_stamina': 4, 'tech_tackling': -4}},
    ],
    'ATT': [
        {'name': 'Target Man', 'statBias': {'phys_strength': 14, 'tech_finishing': 12, 'tech_shooting': 6, 'phys_pace': -8, 'tech_dribbling': -6}},
        {'name': 'Poacher', 'statBias': {'tech_shooting': 14, 'ment_composure': 10, 'tech_positioning': 10, 'phys_pace': 2, 'phys_strength': -8}},
        {'name': 'Pacey Forward', 'statBias': {'phys_pace': 14, 'phys_acceleration': 12, 'tech_dribbling': 8, 'phys_strength': -8, 'tech_passing': -2}},
        {'name': 'Complete Forward', 'statBias': {'tech_shooting': 8, 'tech_dribbling': 8, 'phys_pace': 6, 'phys_strength': 4, 'tech_passing': 4}},
        {'name': 'Inside Forward', 'statBias': {'tech_dribbling': 12, 'tech_shooting': 10, 'phys_pace': 8, 'phys_strength': -6, 'tech_finishing': -8}},
    ],
}

ARCHETYPE_CONFIG = {
    'TACTICIAN': {
        'youthDevelopmentMultiplier': 0.85,
        'overperformanceMultiplier': 1.35,
        'chairmanRelationshipDecayRate': 0.9,
        'transferRequestFrequency': 0.15,
        'moraleSwingAmplitude': 0.8,
    },
    'MOTIVATOR': {
        'youthDevelopmentMultiplier': 0.90,
        'overperformanceMultiplier': 1.28,
        'chairmanRelationshipDecayRate': 0.75,
        'transferRequestFrequency': 0.08,
        'moraleSwingAmplitude': 1.5,
    },
    'YOUTH_DEVELOPER': {
        'youthDevelopmentMultiplier': 1.6,
        'overperformanceMultiplier': 0.95,
        'chairmanRelationshipDecayRate': 1.1,
        'transferRequestFrequency': 0.35,
        'moraleSwingAmplitude': 0.9,
    },
    'PRAGMATIST': {
        'youthDevelopmentMultiplier': 0.70,
        'overperformanceMultiplier': 1.1,
        'chairmanRelationshipDecayRate': 0.85,
        'transferRequestFrequency': 0.25,
        'moraleSwingAmplitude': 0.6,
    },
    'FIREBRAND': {
        'youthDevelopmentMultiplier': 0.75,
        'overperformanceMultiplier': 1.45,
        'chairmanRelationshipDecayRate': 1.25,
        'transferRequestFrequency': 0.5,
        'moraleSwingAmplitude': 2.0,
    },
    'VETERAN': {
        'youthDevelopmentMultiplier': 0.95,
        'overperformanceMultiplier': 1.2,
        'chairmanRelationshipDecayRate': 0.8,
        'transferRequestFrequency': 0.12,
        'moraleSwingAmplitude': 0.85,
    },
}

FORMATION_CONFIG = {
    '4-4-2': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('LM', 'MID'), ('CM1', 'MID'), ('CM2', 'MID'), ('RM', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
    '4-3-3': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('CM1', 'MID'), ('CM2', 'MID'), ('CM3', 'MID'),
        ('LW', 'ATT'), ('RW', 'ATT'), ('ST', 'ATT')
    ],
    '3-5-2': [
        ('GK', 'GK'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'),
        ('LWB', 'DEF'), ('RWB', 'DEF'), ('CM1', 'MID'), ('CM2', 'MID'), ('CM3', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
    '4-2-3-1': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('CDM1', 'MID'), ('CDM2', 'MID'), ('LAM', 'MID'), ('CAM', 'MID'), ('RAM', 'MID'),
        ('ST', 'ATT')
    ],
    '5-4-1': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('CB3', 'DEF'), ('RB', 'DEF'),
        ('LM', 'MID'), ('CM1', 'MID'), ('CM2', 'MID'), ('RM', 'MID'),
        ('ST', 'ATT')
    ],
    '4-4-2_DIAMOND': [
        ('GK', 'GK'), ('LB', 'DEF'), ('CB1', 'DEF'), ('CB2', 'DEF'), ('RB', 'DEF'),
        ('CDM', 'MID'), ('LM', 'MID'), ('RM', 'MID'), ('CAM', 'MID'),
        ('ST1', 'ATT'), ('ST2', 'ATT')
    ],
}

# ── HELPERS ──────────────────────────────────────────

def pick_nationality(tier):
    rand = random.random()
    if tier == 1:
        if rand < 0.16: return {'first': ENGLISH_FIRST, 'last': ENGLISH_LAST, 'name': 'English'}
        if rand < 0.28: return {'first': BRAZILIAN_FIRST, 'last': BRAZILIAN_LAST, 'name': 'Brazilian'}
        if rand < 0.40: return {'first': FRENCH_FIRST, 'last': FRENCH_LAST, 'name': 'French'}
        if rand < 0.52: return {'first': SPANISH_FIRST, 'last': SPANISH_LAST, 'name': 'Spanish'}
        if rand < 0.62: return {'first': AFRICAN_FIRST, 'last': AFRICAN_LAST, 'name': 'African'}
        if rand < 0.72: return {'first': GERMAN_FIRST, 'last': GERMAN_LAST, 'name': 'German'}
        if rand < 0.82: return {'first': SCANDINAVIAN_FIRST, 'last': SCANDINAVIAN_LAST, 'name': 'Scandinavian'}
        if rand < 0.91: return {'first': ASIAN_FIRST, 'last': ASIAN_LAST, 'name': 'Asian'}
        return {'first': NORTH_AMERICAN_FIRST, 'last': NORTH_AMERICAN_LAST, 'name': 'North American'}
    if tier == 2:
        if rand < 0.45: return {'first': ENGLISH_FIRST, 'last': ENGLISH_LAST, 'name': 'English'}
        if rand < 0.60: return {'first': FRENCH_FIRST, 'last': FRENCH_LAST, 'name': 'French'}
        if rand < 0.72: return {'first': AFRICAN_FIRST, 'last': AFRICAN_LAST, 'name': 'African'}
        if rand < 0.82: return {'first': SPANISH_FIRST, 'last': SPANISH_LAST, 'name': 'Spanish'}
        if rand < 0.90: return {'first': GERMAN_FIRST, 'last': GERMAN_LAST, 'name': 'German'}
        return {'first': SCANDINAVIAN_FIRST, 'last': SCANDINAVIAN_LAST, 'name': 'Scandinavian'}
    if tier == 3:
        if rand < 0.70: return {'first': ENGLISH_FIRST, 'last': ENGLISH_LAST, 'name': 'English'}
        if rand < 0.82: return {'first': AFRICAN_FIRST, 'last': AFRICAN_LAST, 'name': 'African'}
        if rand < 0.91: return {'first': FRENCH_FIRST, 'last': FRENCH_LAST, 'name': 'French'}
        return {'first': SPANISH_FIRST, 'last': SPANISH_LAST, 'name': 'Spanish'}
    if tier == 4:
        if rand < 0.85: return {'first': ENGLISH_FIRST, 'last': ENGLISH_LAST, 'name': 'English'}
        if rand < 0.94: return {'first': AFRICAN_FIRST, 'last': AFRICAN_LAST, 'name': 'African'}
        return {'first': FRENCH_FIRST, 'last': FRENCH_LAST, 'name': 'French'}
    return {'first': ENGLISH_FIRST, 'last': ENGLISH_LAST, 'name': 'English'}

def generate_age(tier, is_youth=False):
    if is_youth: return 16 + random.randint(0, 3)
    rand = random.random()
    if tier == 1:
        if rand < 0.08: return 17 + random.randint(0, 2)
        if rand < 0.30: return 20 + random.randint(0, 2)
        if rand < 0.72: return 23 + random.randint(0, 6)
        if rand < 0.92: return 30 + random.randint(0, 3)
        return 34 + random.randint(0, 2)
    if tier == 2:
        if rand < 0.06: return 17 + random.randint(0, 2)
        if rand < 0.25: return 20 + random.randint(0, 2)
        if rand < 0.65: return 23 + random.randint(0, 6)
        if rand < 0.88: return 30 + random.randint(0, 3)
        return 34 + random.randint(0, 2)
    if tier == 3:
        if rand < 0.12: return 17 + random.randint(0, 2)
        if rand < 0.30: return 20 + random.randint(0, 2)
        if rand < 0.60: return 23 + random.randint(0, 6)
        if rand < 0.85: return 30 + random.randint(0, 4)
        return 35 + random.randint(0, 2)
    if tier == 4:
        if rand < 0.15: return 17 + random.randint(0, 2)
        if rand < 0.28: return 20 + random.randint(0, 2)
        if rand < 0.52: return 23 + random.randint(0, 6)
        if rand < 0.80: return 30 + random.randint(0, 4)
        return 35 + random.randint(0, 3)
    if rand < 0.20: return 16 + random.randint(0, 3)
    if rand < 0.35: return 20 + random.randint(0, 2)
    if rand < 0.52: return 23 + random.randint(0, 6)
    if rand < 0.75: return 30 + random.randint(0, 4)
    return 35 + random.randint(0, 4)

def determine_manager_archetype(coaching, personality, coaching_ability):
    tactical = coaching['tactical']
    mental = coaching['mental']
    working_with_youth = coaching['youth']
    player_management = personality['player_mgmt']
    loyalty = personality['loyalty']
    defensive = coaching['defensive']
    attacking = coaching['attacking']

    if tactical > 80: return 'TACTICIAN'
    if player_management > 80 and mental > 75: return 'MOTIVATOR'
    if working_with_youth > 80: return 'YOUTH_DEVELOPER'
    if defensive > 75 and attacking < 70: return 'PRAGMATIST'
    if coaching_ability > 70 and loyalty < 40: return 'FIREBRAND'
    if coaching_ability > 85: return 'VETERAN'
    return 'MOTIVATOR'

def map_board_type_to_culture(board_type):
    if board_type == 'BILLIONAIRE': return ['WINNING']
    if board_type == 'FAN_OWNED': return ['YOUTH_DEVELOPMENT']
    if board_type == 'LOCAL': return ['PRAGMATIC']
    if board_type == 'CORPORATE': return ['SELLING']
    return ['PRAGMATIC']

# ── GENERATORS ───────────────────────────────────────

def generate_player(club, tier, is_youth=False):
    tier_cfg = TIER_RATINGS.get(tier, TIER_RATINGS[5])
    age = generate_age(tier, is_youth)

    rating = random.randint(tier_cfg['min'], tier_cfg['max'])
    potential = min(99, rating + random.randint(0, 22 if tier >= 3 else 15))

    pos = random.choice(['GK', 'DEF', 'MID', 'ATT'])
    archetype = random.choice(PLAYER_ARCHETYPES[pos])

    nat_data = pick_nationality(tier)

    def get_biased_stat(base, bias=0):
        v = tier_cfg['variance']
        return max(1, min(99, random.randint(base - v + bias, base + v + bias)))

    stats = {
        'tech_passing': get_biased_stat(rating, archetype['statBias'].get('tech_passing', 0)),
        'tech_shooting': get_biased_stat(rating, archetype['statBias'].get('tech_shooting', 0)),
        'tech_dribbling': get_biased_stat(rating, archetype['statBias'].get('tech_dribbling', 0)),
        'tech_tackling': get_biased_stat(rating, archetype['statBias'].get('tech_tackling', 0)),
        'tech_positioning': get_biased_stat(rating, archetype['statBias'].get('tech_positioning', 0)),
        'tech_vision': get_biased_stat(rating, archetype['statBias'].get('tech_vision', 0)),
        'tech_finishing': get_biased_stat(rating, archetype['statBias'].get('tech_finishing', 0)),
        'tech_handling': get_biased_stat(rating, archetype['statBias'].get('tech_handling', 0)),
        'tech_reflexes': get_biased_stat(rating, archetype['statBias'].get('tech_reflexes', 0)),
        'tech_command_of_area': get_biased_stat(rating, archetype['statBias'].get('tech_command_of_area', 0)),
        'tech_rushing_out': get_biased_stat(rating, archetype['statBias'].get('tech_rushing_out', 0)),
        'phys_pace': get_biased_stat(rating, archetype['statBias'].get('phys_pace', 0)),
        'phys_strength': get_biased_stat(rating, archetype['statBias'].get('phys_strength', 0)),
        'phys_stamina': get_biased_stat(max(30, rating + (5 if tier >= 4 else 0)), archetype['statBias'].get('phys_stamina', 0)),
        'phys_agility': get_biased_stat(rating, archetype['statBias'].get('phys_agility', 0)),
        'phys_acceleration': get_biased_stat(rating, archetype['statBias'].get('phys_acceleration', 0)),
        'ment_leadership': get_biased_stat(55, archetype['statBias'].get('ment_leadership', 0)),
        'ment_composure': get_biased_stat(rating, archetype['statBias'].get('ment_composure', 0)),
        'ment_aggression': get_biased_stat(60, archetype['statBias'].get('ment_aggression', 0)),
        'ment_work_rate': get_biased_stat(67, archetype['statBias'].get('ment_work_rate', 0)),
        'ment_decisions': get_biased_stat(rating, archetype['statBias'].get('ment_decisions', 0)),
        'ment_determination': get_biased_stat(67, archetype['statBias'].get('ment_determination', 0)),
    }

    # Hidden attributes random 20-80
    hidden = {
        'hidden_professionalism': random.randint(20, 80),
        'hidden_ambition': random.randint(20, 80),
        'hidden_loyalty': random.randint(20, 80),
        'hidden_injury_proneness': random.randint(20, 80),
        'hidden_temperament': random.randint(20, 80),
        'hidden_big_match': random.randint(20, 80),
        'hidden_consistency': random.randint(20, 80),
    }

    # Market calcs
    contract_years = random.randint(1, 4)
    pos_premium = {'GK': 0.85, 'DEF': 0.90, 'MID': 1.00, 'ATT': 1.15}[pos]

    age_val_factor = 1.0
    if age <= 17: age_val_factor = 0.40
    elif age <= 19: age_val_factor = 0.65
    elif age <= 21: age_val_factor = 0.85
    elif age <= 23: age_val_factor = 0.95
    elif age <= 27: age_val_factor = 1.00
    elif age <= 29: age_val_factor = 0.88
    elif age <= 31: age_val_factor = 0.70
    elif age <= 33: age_val_factor = 0.50
    elif age <= 35: age_val_factor = 0.30
    else: age_val_factor = 0.15

    potential_gap = max(0, potential - rating)
    pot_factor = 1 + (potential_gap / 100) * (1.5 if age < 24 else 0.8 if age < 28 else 0.3)
    contract_factor = 0.6 + (contract_years * 0.1)

    tier_val_base = {1: 9_000_000, 2: 2_000_000, 3: 350_000, 4: 55_000, 5: 8_000}[tier]
    tier_wage_base = {1: 90_000, 2: 15_000, 3: 2_500, 4: 500, 5: 120}[tier]

    rating_factor = pow(rating / 70, 2.5)
    value = int(tier_val_base * rating_factor * age_val_factor * pot_factor * contract_factor)

    age_wage_factor = 0.5 if age < 20 else 0.75 if age < 24 else 1.0 if age < 30 else 0.85 if age < 33 else 0.65
    wage = int(tier_wage_base * (rating / 65) * pos_premium * age_wage_factor)

    personality = 'PROFESSIONAL'
    if age <= 21 and (potential - rating) >= 15: personality = 'WONDERKID'
    elif age >= 28 and rating >= 70: personality = 'LEADER'
    elif age >= 30: personality = random.choice(['CLUB_HERO', 'LOYAL', 'PROFESSIONAL'])
    else: personality = random.choice(['LOYAL', 'AMBITIOUS', 'PROFESSIONAL', 'TEMPERAMENTAL'])

    player = Player.objects.create(
        club=club,
        first_name=random.choice(nat_data['first']),
        last_name=random.choice(nat_data['last']),
        age=age,
        nationality=nat_data['name'],
        position=pos,
        archetype=archetype['name'],
        overall_rating=rating,
        potential_rating=potential,
        value=max(1000, value),
        wage=max(50, wage),
        contract_years=contract_years,
        personality=personality,
        form=[7.0, 7.0, 7.0, 7.0, 7.0],
        **stats,
        **hidden
    )
    return player

def generate_manager(club, tier):
    if tier == 1: ability = random.randint(70, 95)
    elif tier == 2: ability = random.randint(55, 80)
    elif tier == 3: ability = random.randint(40, 65)
    elif tier == 4: ability = random.randint(30, 55)
    else: ability = random.randint(20, 45)

    coaching = {
        'attacking': random.randint(ability - 10, min(99, ability + 10)),
        'defensive': random.randint(ability - 10, min(99, ability + 10)),
        'tactical': random.randint(ability - 10, min(99, ability + 10)),
        'mental': random.randint(ability - 10, min(99, ability + 10)),
        'youth': random.randint(ability - 10, min(99, ability + 10)),
    }
    personality = {
        'discipline': random.randint(ability - 10, min(99, ability + 10)),
        'loyalty': random.randint(ability - 10, min(99, ability + 10)),
        'ambition': random.randint(ability - 10, min(99, ability + 10)),
        'media': random.randint(ability - 10, min(99, ability + 10)),
        'player_mgmt': random.randint(ability - 10, min(99, ability + 10)),
    }

    arch = determine_manager_archetype(coaching, personality, ability)
    config = ARCHETYPE_CONFIG[arch]

    manager = Manager.objects.create(
        club=club,
        name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
        coaching_attacking=coaching['attacking'],
        coaching_defensive=coaching['defensive'],
        coaching_tactical=coaching['tactical'],
        coaching_mental=coaching['mental'],
        coaching_youth=coaching['youth'],
        coaching_ability=ability,
        preferred_formation=random.choice(Formation.values),
        preferred_style=random.choice(TacticalPhilosophy.values),
        personality_discipline=personality['discipline'],
        personality_loyalty=personality['loyalty'],
        personality_ambition=personality['ambition'],
        personality_media=personality['media'],
        personality_player_mgmt=personality['player_mgmt'],
        salary=int(5000 * (ability / 50)),
        archetype=arch,
        archetype_config=config
    )
    return manager

def auto_pick_lineup(club):
    players = list(club.players.all())
    players.sort(key=lambda p: p.overall_rating, reverse=True)

    formation = club.formation
    needed = FORMATION_CONFIG.get(formation, FORMATION_CONFIG['4-4-2'])
    lineup = {}
    used = set()

    for slot_name, role in needed:
        best = next((p for p in players if p.position == role and p.id not in used), None)
        if not best:
            best = next((p for p in players if p.id not in used), None)

        if best:
            lineup[slot_name] = best.id
            used.add(best.id)

    club.starting_lineup = lineup
    club.save()

# ── DATA ─────────────────────────────────────────────

PREMIER_LEAGUE_CLUBS = [
    {'name': 'Man City', 'stadium_name': 'Etihad', 'primary_color': '#6CABDD', 'secondary_color': '#FFFFFF', 'reputation': 97, 'valuation': 4500000000, 'balance': 180000000, 'weekly_wages': 11000000, 'transfer_budget': 200000000, 'stadium_capacity': 53000, 'stadium_level': 9, 'training_level': 9, 'medical_level': 9, 'youth_level': 9, 'board_type': 'CORPORATE', 'season_target': 'CHAMPIONS'},
    {'name': 'Arsenal', 'stadium_name': 'Emirates', 'primary_color': '#EF0107', 'secondary_color': '#FFFFFF', 'reputation': 95, 'valuation': 3800000000, 'balance': 150000000, 'weekly_wages': 9500000, 'transfer_budget': 180000000, 'stadium_capacity': 60704, 'stadium_level': 9, 'training_level': 9, 'medical_level': 9, 'youth_level': 8, 'board_type': 'CORPORATE', 'season_target': 'CHAMPIONS'},
    {'name': 'Liverpool', 'stadium_name': 'Anfield', 'primary_color': '#C8102E', 'secondary_color': '#F6EB61', 'reputation': 96, 'valuation': 4200000000, 'balance': 160000000, 'weekly_wages': 10000000, 'transfer_budget': 170000000, 'stadium_capacity': 61276, 'stadium_level': 9, 'training_level': 9, 'medical_level': 9, 'youth_level': 9, 'board_type': 'CORPORATE', 'season_target': 'CHAMPIONS'},
    {'name': 'Chelsea', 'stadium_name': 'Stamford Bridge', 'primary_color': '#034694', 'secondary_color': '#FFFFFF', 'reputation': 91, 'valuation': 2800000000, 'balance': 90000000, 'weekly_wages': 10500000, 'transfer_budget': 150000000, 'stadium_capacity': 40343, 'stadium_level': 9, 'training_level': 9, 'medical_level': 8, 'youth_level': 8, 'board_type': 'BILLIONAIRE', 'season_target': 'CHAMPIONS'},
    {'name': 'Man Utd', 'stadium_name': 'Old Trafford', 'primary_color': '#DA291C', 'secondary_color': '#FBE122', 'reputation': 93, 'valuation': 3200000000, 'balance': 60000000, 'weekly_wages': 9000000, 'transfer_budget': 100000000, 'stadium_capacity': 74879, 'stadium_level': 9, 'training_level': 9, 'medical_level': 8, 'youth_level': 8, 'board_type': 'BILLIONAIRE', 'season_target': 'CHAMPIONS'},
    {'name': 'Tottenham', 'stadium_name': 'Tottenham Hotspur Stadium', 'primary_color': '#132257', 'secondary_color': '#FFFFFF', 'reputation': 89, 'valuation': 2500000000, 'balance': 80000000, 'weekly_wages': 8000000, 'transfer_budget': 120000000, 'stadium_capacity': 62850, 'stadium_level': 9, 'training_level': 8, 'medical_level': 8, 'youth_level': 8, 'board_type': 'CORPORATE', 'season_target': 'TOP_HALF'},
    {'name': 'Newcastle', 'stadium_name': 'St James Park', 'primary_color': '#241F20', 'secondary_color': '#FFFFFF', 'reputation': 85, 'valuation': 1800000000, 'balance': 70000000, 'weekly_wages': 7000000, 'transfer_budget': 100000000, 'stadium_capacity': 52305, 'stadium_level': 8, 'training_level': 8, 'medical_level': 7, 'youth_level': 7, 'board_type': 'BILLIONAIRE', 'season_target': 'PROMOTION'},
    {'name': 'Aston Villa', 'stadium_name': 'Villa Park', 'primary_color': '#95BFE5', 'secondary_color': '#670E36', 'reputation': 83, 'valuation': 1400000000, 'balance': 65000000, 'weekly_wages': 6500000, 'transfer_budget': 80000000, 'stadium_capacity': 42785, 'stadium_level': 8, 'training_level': 8, 'medical_level': 7, 'youth_level': 7, 'board_type': 'BILLIONAIRE', 'season_target': 'PROMOTION'},
    {'name': 'Brighton', 'stadium_name': 'Amex Stadium', 'primary_color': '#0057B8', 'secondary_color': '#FFFFFF', 'reputation': 78, 'valuation': 900000000, 'balance': 55000000, 'weekly_wages': 4500000, 'transfer_budget': 60000000, 'stadium_capacity': 31800, 'stadium_level': 7, 'training_level': 9, 'medical_level': 8, 'youth_level': 9, 'board_type': 'LOCAL', 'season_target': 'TOP_HALF'},
    {'name': 'West Ham', 'stadium_name': 'London Stadium', 'primary_color': '#7A263A', 'secondary_color': '#1BB1E7', 'reputation': 76, 'valuation': 800000000, 'balance': 40000000, 'weekly_wages': 5000000, 'transfer_budget': 50000000, 'stadium_capacity': 62500, 'stadium_level': 7, 'training_level': 7, 'medical_level': 7, 'youth_level': 6, 'board_type': 'CORPORATE', 'season_target': 'TOP_HALF'},
    {'name': 'Wolves', 'stadium_name': 'Molineux', 'primary_color': '#FDB913', 'secondary_color': '#231F20', 'reputation': 73, 'valuation': 600000000, 'balance': 30000000, 'weekly_wages': 4000000, 'transfer_budget': 40000000, 'stadium_capacity': 32050, 'stadium_level': 7, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'CORPORATE', 'season_target': 'MID_TABLE'},
    {'name': 'Everton', 'stadium_name': 'Goodison Park', 'primary_color': '#003399', 'secondary_color': '#FFFFFF', 'reputation': 72, 'valuation': 500000000, 'balance': 20000000, 'weekly_wages': 4500000, 'transfer_budget': 30000000, 'stadium_capacity': 39572, 'stadium_level': 6, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'Fulham', 'stadium_name': 'Craven Cottage', 'primary_color': '#FFFFFF', 'secondary_color': '#000000', 'reputation': 70, 'valuation': 450000000, 'balance': 35000000, 'weekly_wages': 3800000, 'transfer_budget': 35000000, 'stadium_capacity': 25700, 'stadium_level': 6, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'Brentford', 'stadium_name': 'Gtech Community Stadium', 'primary_color': '#E30613', 'secondary_color': '#FFFFFF', 'reputation': 68, 'valuation': 380000000, 'balance': 30000000, 'weekly_wages': 3200000, 'transfer_budget': 30000000, 'stadium_capacity': 17250, 'stadium_level': 6, 'training_level': 7, 'medical_level': 7, 'youth_level': 7, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Crystal Palace', 'stadium_name': 'Selhurst Park', 'primary_color': '#1B458F', 'secondary_color': '#C4122E', 'reputation': 67, 'valuation': 400000000, 'balance': 25000000, 'weekly_wages': 3500000, 'transfer_budget': 25000000, 'stadium_capacity': 25486, 'stadium_level': 6, 'training_level': 6, 'medical_level': 6, 'youth_level': 6, 'board_type': 'CORPORATE', 'season_target': 'MID_TABLE'},
    {'name': 'Nottm Forest', 'stadium_name': 'City Ground', 'primary_color': '#E53233', 'secondary_color': '#FFFFFF', 'reputation': 66, 'valuation': 380000000, 'balance': 20000000, 'weekly_wages': 4000000, 'transfer_budget': 25000000, 'stadium_capacity': 30445, 'stadium_level': 6, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'Bournemouth', 'stadium_name': 'Vitality Stadium', 'primary_color': '#DA291C', 'secondary_color': '#000000', 'reputation': 62, 'valuation': 280000000, 'balance': 20000000, 'weekly_wages': 3000000, 'transfer_budget': 20000000, 'stadium_capacity': 11307, 'stadium_level': 5, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'BILLIONAIRE', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Leicester', 'stadium_name': 'King Power Stadium', 'primary_color': '#003090', 'secondary_color': '#FDBE11', 'reputation': 65, 'valuation': 320000000, 'balance': 15000000, 'weekly_wages': 4000000, 'transfer_budget': 20000000, 'stadium_capacity': 32261, 'stadium_level': 6, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'BILLIONAIRE', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Ipswich', 'stadium_name': 'Portman Road', 'primary_color': '#0044A9', 'secondary_color': '#FFFFFF', 'reputation': 58, 'valuation': 200000000, 'balance': 15000000, 'weekly_wages': 2500000, 'transfer_budget': 15000000, 'stadium_capacity': 29721, 'stadium_level': 5, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'CORPORATE', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Southampton', 'stadium_name': 'St Mary\'s', 'primary_color': '#D71920', 'secondary_color': '#FFFFFF', 'reputation': 57, 'valuation': 180000000, 'balance': 10000000, 'weekly_wages': 3000000, 'transfer_budget': 10000000, 'stadium_capacity': 32384, 'stadium_level': 5, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'CORPORATE', 'season_target': 'AVOID_RELEGATION'},
]

CHAMPIONSHIP_CLUBS = [
    {'name': 'Leeds United', 'stadium_name': 'Elland Road', 'primary_color': '#FFCD00', 'secondary_color': '#1D428A', 'reputation': 72, 'valuation': 380000000, 'balance': 25000000, 'weekly_wages': 3500000, 'transfer_budget': 30000000, 'stadium_capacity': 37890, 'stadium_level': 7, 'training_level': 7, 'medical_level': 6, 'youth_level': 6, 'board_type': 'CORPORATE', 'season_target': 'PROMOTION'},
    {'name': 'Sunderland', 'stadium_name': 'Stadium of Light', 'primary_color': '#EB172B', 'secondary_color': '#FFFFFF', 'reputation': 65, 'valuation': 180000000, 'balance': 15000000, 'weekly_wages': 2000000, 'transfer_budget': 15000000, 'stadium_capacity': 49000, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'CORPORATE', 'season_target': 'PROMOTION'},
    {'name': 'Sheffield Utd', 'stadium_name': 'Bramall Lane', 'primary_color': '#EE2737', 'secondary_color': '#000000', 'reputation': 66, 'valuation': 200000000, 'balance': 12000000, 'weekly_wages': 3000000, 'transfer_budget': 20000000, 'stadium_capacity': 32125, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Middlesbrough', 'stadium_name': 'Riverside Stadium', 'primary_color': '#E53233', 'secondary_color': '#FFFFFF', 'reputation': 63, 'valuation': 150000000, 'balance': 12000000, 'weekly_wages': 2000000, 'transfer_budget': 12000000, 'stadium_capacity': 34742, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Burnley', 'stadium_name': 'Turf Moor', 'primary_color': '#6C1D45', 'secondary_color': '#99D6EA', 'reputation': 64, 'valuation': 160000000, 'balance': 10000000, 'weekly_wages': 2500000, 'transfer_budget': 15000000, 'stadium_capacity': 21944, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'BILLIONAIRE', 'season_target': 'PROMOTION'},
    {'name': 'West Brom', 'stadium_name': 'The Hawthorns', 'primary_color': '#122F67', 'secondary_color': '#FFFFFF', 'reputation': 64, 'valuation': 170000000, 'balance': 10000000, 'weekly_wages': 2200000, 'transfer_budget': 12000000, 'stadium_capacity': 26852, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'LOCAL', 'season_target': 'PLAYOFFS'},
    {'name': 'Bristol City', 'stadium_name': 'Ashton Gate', 'primary_color': '#E3001B', 'secondary_color': '#FFFFFF', 'reputation': 58, 'valuation': 120000000, 'balance': 8000000, 'weekly_wages': 1500000, 'transfer_budget': 8000000, 'stadium_capacity': 27000, 'stadium_level': 5, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'LOCAL', 'season_target': 'PLAYOFFS'},
    {'name': 'Coventry', 'stadium_name': 'CBS Arena', 'primary_color': '#59CBFF', 'secondary_color': '#FFFFFF', 'reputation': 57, 'valuation': 100000000, 'balance': 8000000, 'weekly_wages': 1400000, 'transfer_budget': 7000000, 'stadium_capacity': 32609, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 5, 'board_type': 'LOCAL', 'season_target': 'PLAYOFFS'},
    {'name': 'Blackburn', 'stadium_name': 'Ewood Park', 'primary_color': '#009EE0', 'secondary_color': '#FFFFFF', 'reputation': 60, 'valuation': 130000000, 'balance': 8000000, 'weekly_wages': 1600000, 'transfer_budget': 8000000, 'stadium_capacity': 31367, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'Preston', 'stadium_name': 'Deepdale', 'primary_color': '#FFFFFF', 'secondary_color': '#000066', 'reputation': 55, 'valuation': 80000000, 'balance': 6000000, 'weekly_wages': 1200000, 'transfer_budget': 6000000, 'stadium_capacity': 23404, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Millwall', 'stadium_name': 'The Den', 'primary_color': '#001D5E', 'secondary_color': '#FFFFFF', 'reputation': 55, 'valuation': 80000000, 'balance': 5000000, 'weekly_wages': 1200000, 'transfer_budget': 5000000, 'stadium_capacity': 20146, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Norwich', 'stadium_name': 'Carrow Road', 'primary_color': '#00A650', 'secondary_color': '#FFF200', 'reputation': 63, 'valuation': 155000000, 'balance': 10000000, 'weekly_wages': 2000000, 'transfer_budget': 12000000, 'stadium_capacity': 27359, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'FAN_OWNED', 'season_target': 'PROMOTION'},
    {'name': 'Hull City', 'stadium_name': 'MKM Stadium', 'primary_color': '#F5A12D', 'secondary_color': '#000000', 'reputation': 56, 'valuation': 90000000, 'balance': 6000000, 'weekly_wages': 1300000, 'transfer_budget': 6000000, 'stadium_capacity': 25400, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'QPR', 'stadium_name': 'Loftus Road', 'primary_color': '#1D5BA4', 'secondary_color': '#FFFFFF', 'reputation': 57, 'valuation': 95000000, 'balance': 5000000, 'weekly_wages': 1400000, 'transfer_budget': 5000000, 'stadium_capacity': 18360, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'Stoke City', 'stadium_name': 'bet365 Stadium', 'primary_color': '#E03A3E', 'secondary_color': '#FFFFFF', 'reputation': 60, 'valuation': 130000000, 'balance': 7000000, 'weekly_wages': 2000000, 'transfer_budget': 8000000, 'stadium_capacity': 30089, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'BILLIONAIRE', 'season_target': 'PLAYOFFS'},
    {'name': 'Swansea', 'stadium_name': 'Swansea.com Stadium', 'primary_color': '#FFFFFF', 'secondary_color': '#000000', 'reputation': 58, 'valuation': 100000000, 'balance': 6000000, 'weekly_wages': 1300000, 'transfer_budget': 6000000, 'stadium_capacity': 21088, 'stadium_level': 5, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'FAN_OWNED', 'season_target': 'MID_TABLE'},
    {'name': 'Cardiff', 'stadium_name': 'Cardiff City Stadium', 'primary_color': '#0070B5', 'secondary_color': '#D71920', 'reputation': 58, 'valuation': 110000000, 'balance': 6000000, 'weekly_wages': 1500000, 'transfer_budget': 6000000, 'stadium_capacity': 33280, 'stadium_level': 5, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'Derby County', 'stadium_name': 'Pride Park', 'primary_color': '#FFFFFF', 'secondary_color': '#000000', 'reputation': 62, 'valuation': 140000000, 'balance': 8000000, 'weekly_wages': 1800000, 'transfer_budget': 8000000, 'stadium_capacity': 33597, 'stadium_level': 6, 'training_level': 6, 'medical_level': 5, 'youth_level': 5, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Luton', 'stadium_name': 'Kenilworth Road', 'primary_color': '#F78F1E', 'secondary_color': '#FFFFFF', 'reputation': 56, 'valuation': 85000000, 'balance': 5000000, 'weekly_wages': 1300000, 'transfer_budget': 5000000, 'stadium_capacity': 12000, 'stadium_level': 4, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Plymouth', 'stadium_name': 'Home Park', 'primary_color': '#006B54', 'secondary_color': '#FFFFFF', 'reputation': 52, 'valuation': 60000000, 'balance': 4000000, 'weekly_wages': 1000000, 'transfer_budget': 4000000, 'stadium_capacity': 18600, 'stadium_level': 4, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
]

LEAGUE_ONE_CLUBS = [
    {'name': 'Birmingham City', 'stadium_name': 'St Andrews', 'primary_color': '#0000FF', 'secondary_color': '#FFFFFF', 'reputation': 58, 'valuation': 75000000, 'balance': 3000000, 'weekly_wages': 800000, 'transfer_budget': 4000000, 'stadium_capacity': 29409, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'BILLIONAIRE', 'season_target': 'PROMOTION'},
    {'name': 'Wrexham', 'stadium_name': 'Racecourse Ground', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 52, 'valuation': 40000000, 'balance': 3000000, 'weekly_wages': 500000, 'transfer_budget': 3000000, 'stadium_capacity': 10771, 'stadium_level': 4, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'CORPORATE', 'season_target': 'PROMOTION'},
    {'name': 'Stockport', 'stadium_name': 'Edgeley Park', 'primary_color': '#1C3B8C', 'secondary_color': '#FFFFFF', 'reputation': 48, 'valuation': 25000000, 'balance': 2000000, 'weekly_wages': 250000, 'transfer_budget': 1500000, 'stadium_capacity': 10841, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Peterborough', 'stadium_name': 'London Road', 'primary_color': '#0066CC', 'secondary_color': '#FFFFFF', 'reputation': 50, 'valuation': 30000000, 'balance': 2000000, 'weekly_wages': 350000, 'transfer_budget': 2000000, 'stadium_capacity': 15314, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 4, 'board_type': 'LOCAL', 'season_target': 'PLAYOFFS'},
    {'name': 'Exeter City', 'stadium_name': 'St James Park', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 46, 'valuation': 18000000, 'balance': 1500000, 'weekly_wages': 200000, 'transfer_budget': 1000000, 'stadium_capacity': 8830, 'stadium_level': 3, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'FAN_OWNED', 'season_target': 'MID_TABLE'},
    {'name': 'Oxford Utd', 'stadium_name': 'Kassam Stadium', 'primary_color': '#FFD700', 'secondary_color': '#000066', 'reputation': 50, 'valuation': 28000000, 'balance': 2000000, 'weekly_wages': 300000, 'transfer_budget': 2000000, 'stadium_capacity': 12500, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'BILLIONAIRE', 'season_target': 'PLAYOFFS'},
    {'name': 'Charlton', 'stadium_name': 'The Valley', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 53, 'valuation': 45000000, 'balance': 2500000, 'weekly_wages': 450000, 'transfer_budget': 2500000, 'stadium_capacity': 27111, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'Rotherham', 'stadium_name': 'New York Stadium', 'primary_color': '#E62020', 'secondary_color': '#FFFFFF', 'reputation': 47, 'valuation': 20000000, 'balance': 1500000, 'weekly_wages': 250000, 'transfer_budget': 1500000, 'stadium_capacity': 12021, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Bolton', 'stadium_name': 'Toughsheet Stadium', 'primary_color': '#FFFFFF', 'secondary_color': '#000080', 'reputation': 52, 'valuation': 35000000, 'balance': 2000000, 'weekly_wages': 350000, 'transfer_budget': 2000000, 'stadium_capacity': 28723, 'stadium_level': 5, 'training_level': 4, 'medical_level': 4, 'youth_level': 4, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'Cambridge Utd', 'stadium_name': 'Abbey Stadium', 'primary_color': '#F5A12D', 'secondary_color': '#000000', 'reputation': 44, 'valuation': 15000000, 'balance': 1000000, 'weekly_wages': 180000, 'transfer_budget': 800000, 'stadium_capacity': 8127, 'stadium_level': 3, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Reading', 'stadium_name': 'Select Car Leasing Stadium', 'primary_color': '#004494', 'secondary_color': '#FFFFFF', 'reputation': 55, 'valuation': 55000000, 'balance': 2000000, 'weekly_wages': 600000, 'transfer_budget': 3000000, 'stadium_capacity': 24161, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'CORPORATE', 'season_target': 'PROMOTION'},
    {'name': 'Wigan Athletic', 'stadium_name': 'DW Stadium', 'primary_color': '#1D428A', 'secondary_color': '#FFFFFF', 'reputation': 50, 'valuation': 28000000, 'balance': 1500000, 'weekly_wages': 300000, 'transfer_budget': 1500000, 'stadium_capacity': 25133, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 4, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Huddersfield', 'stadium_name': 'John Smiths Stadium', 'primary_color': '#0E63AD', 'secondary_color': '#FFFFFF', 'reputation': 52, 'valuation': 38000000, 'balance': 2000000, 'weekly_wages': 400000, 'transfer_budget': 2000000, 'stadium_capacity': 24500, 'stadium_level': 5, 'training_level': 5, 'medical_level': 4, 'youth_level': 4, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'Barnsley', 'stadium_name': 'Oakwell', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 48, 'valuation': 22000000, 'balance': 1500000, 'weekly_wages': 220000, 'transfer_budget': 1000000, 'stadium_capacity': 23009, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'CORPORATE', 'season_target': 'MID_TABLE'},
    {'name': 'Shrewsbury', 'stadium_name': 'New Meadow', 'primary_color': '#003399', 'secondary_color': '#FFCC00', 'reputation': 42, 'valuation': 12000000, 'balance': 900000, 'weekly_wages': 160000, 'transfer_budget': 700000, 'stadium_capacity': 9875, 'stadium_level': 3, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Burton Albion', 'stadium_name': 'Pirelli Stadium', 'primary_color': '#FFFF00', 'secondary_color': '#000000', 'reputation': 41, 'valuation': 10000000, 'balance': 800000, 'weekly_wages': 150000, 'transfer_budget': 600000, 'stadium_capacity': 6912, 'stadium_level': 3, 'training_level': 3, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Lincoln City', 'stadium_name': 'LNER Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 43, 'valuation': 13000000, 'balance': 1000000, 'weekly_wages': 170000, 'transfer_budget': 700000, 'stadium_capacity': 10120, 'stadium_level': 3, 'training_level': 4, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Northampton', 'stadium_name': 'Sixfields Stadium', 'primary_color': '#800000', 'secondary_color': '#FFFFFF', 'reputation': 41, 'valuation': 10000000, 'balance': 800000, 'weekly_wages': 150000, 'transfer_budget': 600000, 'stadium_capacity': 7798, 'stadium_level': 3, 'training_level': 3, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Blackpool', 'stadium_name': 'Bloomfield Road', 'primary_color': '#F68712', 'secondary_color': '#FFFFFF', 'reputation': 50, 'valuation': 27000000, 'balance': 1500000, 'weekly_wages': 280000, 'transfer_budget': 1500000, 'stadium_capacity': 16750, 'stadium_level': 4, 'training_level': 4, 'medical_level': 3, 'youth_level': 4, 'board_type': 'CORPORATE', 'season_target': 'MID_TABLE'},
    {'name': 'Port Vale', 'stadium_name': 'Vale Park', 'primary_color': '#000000', 'secondary_color': '#FFFFFF', 'reputation': 40, 'valuation': 9000000, 'balance': 700000, 'weekly_wages': 140000, 'transfer_budget': 500000, 'stadium_capacity': 19052, 'stadium_level': 3, 'training_level': 3, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
]

LEAGUE_TWO_CLUBS = [
    {'name': 'Doncaster Rovers', 'stadium_name': 'Eco-Power Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 40, 'valuation': 8000000, 'balance': 600000, 'weekly_wages': 120000, 'transfer_budget': 500000, 'stadium_capacity': 15231, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Chesterfield', 'stadium_name': 'SMH Group Stadium', 'primary_color': '#1C4FA0', 'secondary_color': '#FFFFFF', 'reputation': 38, 'valuation': 6000000, 'balance': 500000, 'weekly_wages': 100000, 'transfer_budget': 400000, 'stadium_capacity': 10400, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Bradford City', 'stadium_name': 'Valley Parade', 'primary_color': '#800000', 'secondary_color': '#F5A12D', 'reputation': 40, 'valuation': 8000000, 'balance': 600000, 'weekly_wages': 120000, 'transfer_budget': 500000, 'stadium_capacity': 25136, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'FAN_OWNED', 'season_target': 'PROMOTION'},
    {'name': 'MK Dons', 'stadium_name': 'Stadium MK', 'primary_color': '#FFFF00', 'secondary_color': '#000000', 'reputation': 38, 'valuation': 7000000, 'balance': 500000, 'weekly_wages': 110000, 'transfer_budget': 400000, 'stadium_capacity': 30500, 'stadium_level': 4, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'AFC Wimbledon', 'stadium_name': 'Cherry Red Records Stadium', 'primary_color': '#0000FF', 'secondary_color': '#FFFF00', 'reputation': 35, 'valuation': 4000000, 'balance': 400000, 'weekly_wages': 80000, 'transfer_budget': 300000, 'stadium_capacity': 9315, 'stadium_level': 2, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'FAN_OWNED', 'season_target': 'MID_TABLE'},
    {'name': 'Walsall', 'stadium_name': 'Poundland Bescot Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 36, 'valuation': 5000000, 'balance': 400000, 'weekly_wages': 90000, 'transfer_budget': 300000, 'stadium_capacity': 11300, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Newport County', 'stadium_name': 'Rodney Parade', 'primary_color': '#F5A12D', 'secondary_color': '#000000', 'reputation': 30, 'valuation': 2000000, 'balance': 300000, 'weekly_wages': 60000, 'transfer_budget': 200000, 'stadium_capacity': 7850, 'stadium_level': 2, 'training_level': 2, 'medical_level': 2, 'youth_level': 2, 'board_type': 'FAN_OWNED', 'season_target': 'MID_TABLE'},
    {'name': 'Grimsby Town', 'stadium_name': 'Blundell Park', 'primary_color': '#000000', 'secondary_color': '#FFFFFF', 'reputation': 33, 'valuation': 3500000, 'balance': 350000, 'weekly_wages': 75000, 'transfer_budget': 250000, 'stadium_capacity': 9052, 'stadium_level': 2, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Swindon Town', 'stadium_name': 'County Ground', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 37, 'valuation': 5500000, 'balance': 450000, 'weekly_wages': 95000, 'transfer_budget': 350000, 'stadium_capacity': 15728, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'Crewe Alexandra', 'stadium_name': 'Mornflake Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 35, 'valuation': 4000000, 'balance': 350000, 'weekly_wages': 80000, 'transfer_budget': 280000, 'stadium_capacity': 10153, 'stadium_level': 2, 'training_level': 3, 'medical_level': 3, 'youth_level': 3, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Harrogate Town', 'stadium_name': 'EnviroVent Stadium', 'primary_color': '#FFFF00', 'secondary_color': '#000000', 'reputation': 28, 'valuation': 1800000, 'balance': 250000, 'weekly_wages': 55000, 'transfer_budget': 180000, 'stadium_capacity': 4173, 'stadium_level': 2, 'training_level': 2, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Gillingham', 'stadium_name': 'Priestfield Stadium', 'primary_color': '#004B87', 'secondary_color': '#FFFFFF', 'reputation': 33, 'valuation': 3000000, 'balance': 300000, 'weekly_wages': 70000, 'transfer_budget': 220000, 'stadium_capacity': 11582, 'stadium_level': 2, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Accrington', 'stadium_name': 'Wham Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 27, 'valuation': 1500000, 'balance': 220000, 'weekly_wages': 50000, 'transfer_budget': 150000, 'stadium_capacity': 5450, 'stadium_level': 2, 'training_level': 2, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Colchester Utd', 'stadium_name': 'JobServe Community Stadium', 'primary_color': '#0000FF', 'secondary_color': '#FFFFFF', 'reputation': 32, 'valuation': 2800000, 'balance': 280000, 'weekly_wages': 65000, 'transfer_budget': 200000, 'stadium_capacity': 10105, 'stadium_level': 2, 'training_level': 2, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Crawley Town', 'stadium_name': 'Broadfield Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 30, 'valuation': 2200000, 'balance': 250000, 'weekly_wages': 58000, 'transfer_budget': 180000, 'stadium_capacity': 6000, 'stadium_level': 2, 'training_level': 2, 'medical_level': 2, 'youth_level': 2, 'board_type': 'BILLIONAIRE', 'season_target': 'MID_TABLE'},
    {'name': 'Tranmere Rovers', 'stadium_name': 'Prenton Park', 'primary_color': '#FFFFFF', 'secondary_color': '#000080', 'reputation': 34, 'valuation': 3500000, 'balance': 300000, 'weekly_wages': 72000, 'transfer_budget': 230000, 'stadium_capacity': 16789, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Morecambe', 'stadium_name': 'Mazuma Mobile Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 28, 'valuation': 1800000, 'balance': 220000, 'weekly_wages': 52000, 'transfer_budget': 160000, 'stadium_capacity': 6476, 'stadium_level': 2, 'training_level': 2, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Fleetwood Town', 'stadium_name': 'Highbury Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 35, 'valuation': 4500000, 'balance': 380000, 'weekly_wages': 85000, 'transfer_budget': 300000, 'stadium_capacity': 5327, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'BILLIONAIRE', 'season_target': 'PLAYOFFS'},
    {'name': 'Salford City', 'stadium_name': 'Peninsula Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 36, 'valuation': 5000000, 'balance': 400000, 'weekly_wages': 90000, 'transfer_budget': 320000, 'stadium_capacity': 5106, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 3, 'board_type': 'CORPORATE', 'season_target': 'PLAYOFFS'},
    {'name': 'Carlisle United', 'stadium_name': 'Brunton Park', 'primary_color': '#1C4FA0', 'secondary_color': '#FFFFFF', 'reputation': 32, 'valuation': 2500000, 'balance': 260000, 'weekly_wages': 62000, 'transfer_budget': 190000, 'stadium_capacity': 17949, 'stadium_level': 2, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
]

NATIONAL_LEAGUE_CLUBS = [
    {'name': 'York City', 'stadium_name': 'LNER Community Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 34, 'valuation': 2500000, 'balance': 180000, 'weekly_wages': 55000, 'transfer_budget': 150000, 'stadium_capacity': 8000, 'stadium_level': 3, 'training_level': 3, 'medical_level': 2, 'youth_level': 2, 'board_type': 'FAN_OWNED', 'season_target': 'PROMOTION'},
    {'name': 'Solihull Moors', 'stadium_name': 'SportNation.bet Stadium', 'primary_color': '#FFD700', 'secondary_color': '#000000', 'reputation': 28, 'valuation': 900000, 'balance': 80000, 'weekly_wages': 25000, 'transfer_budget': 60000, 'stadium_capacity': 30500, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Gateshead', 'stadium_name': 'Gateshead International Stadium', 'primary_color': '#000000', 'secondary_color': '#FFFFFF', 'reputation': 26, 'valuation': 700000, 'balance': 60000, 'weekly_wages': 20000, 'transfer_budget': 40000, 'stadium_capacity': 11750, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Oldham Athletic', 'stadium_name': 'Boundary Park', 'primary_color': '#004B87', 'secondary_color': '#FFFFFF', 'reputation': 32, 'valuation': 1800000, 'balance': 120000, 'weekly_wages': 40000, 'transfer_budget': 100000, 'stadium_capacity': 13512, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 2, 'board_type': 'LOCAL', 'season_target': 'PROMOTION'},
    {'name': 'Hartlepool Utd', 'stadium_name': 'Victoria Park', 'primary_color': '#003087', 'secondary_color': '#FFFFFF', 'reputation': 30, 'valuation': 1200000, 'balance': 90000, 'weekly_wages': 30000, 'transfer_budget': 70000, 'stadium_capacity': 7856, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Eastleigh', 'stadium_name': 'Silverlake Stadium', 'primary_color': '#003087', 'secondary_color': '#FFFFFF', 'reputation': 24, 'valuation': 500000, 'balance': 50000, 'weekly_wages': 18000, 'transfer_budget': 30000, 'stadium_capacity': 5250, 'stadium_level': 1, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'FC Halifax Town', 'stadium_name': 'The Shay', 'primary_color': '#003087', 'secondary_color': '#FFFF00', 'reputation': 26, 'valuation': 650000, 'balance': 55000, 'weekly_wages': 20000, 'transfer_budget': 40000, 'stadium_capacity': 14000, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'FAN_OWNED', 'season_target': 'MID_TABLE'},
    {'name': 'Altrincham', 'stadium_name': 'J Davidson Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 25, 'valuation': 550000, 'balance': 50000, 'weekly_wages': 18000, 'transfer_budget': 35000, 'stadium_capacity': 6085, 'stadium_level': 1, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'FAN_OWNED', 'season_target': 'MID_TABLE'},
    {'name': 'Boreham Wood', 'stadium_name': 'Meadow Park', 'primary_color': '#FFFFFF', 'secondary_color': '#000000', 'reputation': 22, 'valuation': 350000, 'balance': 35000, 'weekly_wages': 15000, 'transfer_budget': 25000, 'stadium_capacity': 4502, 'stadium_level': 1, 'training_level': 1, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Bromley', 'stadium_name': 'Hayes Lane', 'primary_color': '#000000', 'secondary_color': '#FFFFFF', 'reputation': 25, 'valuation': 550000, 'balance': 50000, 'weekly_wages': 18000, 'transfer_budget': 35000, 'stadium_capacity': 5000, 'stadium_level': 1, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Woking', 'stadium_name': 'Kingfield Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 24, 'valuation': 450000, 'balance': 40000, 'weekly_wages': 16000, 'transfer_budget': 28000, 'stadium_capacity': 6036, 'stadium_level': 1, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'FAN_OWNED', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Maidenhead Utd', 'stadium_name': 'York Road', 'primary_color': '#000000', 'secondary_color': '#FFFFFF', 'reputation': 20, 'valuation': 280000, 'balance': 28000, 'weekly_wages': 15000, 'transfer_budget': 20000, 'stadium_capacity': 4500, 'stadium_level': 1, 'training_level': 1, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Wealdstone', 'stadium_name': 'Grosvenor Vale', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 20, 'valuation': 250000, 'balance': 25000, 'weekly_wages': 15000, 'transfer_budget': 18000, 'stadium_capacity': 3000, 'stadium_level': 1, 'training_level': 1, 'medical_level': 1, 'youth_level': 1, 'board_type': 'FAN_OWNED', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Dorking Wanderers', 'stadium_name': 'Meadowbank', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 19, 'valuation': 220000, 'balance': 22000, 'weekly_wages': 15000, 'transfer_budget': 15000, 'stadium_capacity': 4000, 'stadium_level': 1, 'training_level': 1, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Kidderminster', 'stadium_name': 'Aggborough Stadium', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 22, 'valuation': 320000, 'balance': 30000, 'weekly_wages': 15000, 'transfer_budget': 20000, 'stadium_capacity': 6444, 'stadium_level': 1, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Southend Utd', 'stadium_name': 'Roots Hall', 'primary_color': '#003087', 'secondary_color': '#FFFFFF', 'reputation': 32, 'valuation': 1500000, 'balance': 100000, 'weekly_wages': 35000, 'transfer_budget': 80000, 'stadium_capacity': 12392, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 2, 'board_type': 'CORPORATE', 'season_target': 'PROMOTION'},
    {'name': 'Barnet', 'stadium_name': 'Underhill Stadium', 'primary_color': '#F5A12D', 'secondary_color': '#000000', 'reputation': 28, 'valuation': 850000, 'balance': 70000, 'weekly_wages': 22000, 'transfer_budget': 50000, 'stadium_capacity': 5500, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Dag & Red', 'stadium_name': 'Victoria Road', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 27, 'valuation': 750000, 'balance': 65000, 'weekly_wages': 20000, 'transfer_budget': 45000, 'stadium_capacity': 6078, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
    {'name': 'Ebbsfleet Utd', 'stadium_name': 'Stonebridge Road', 'primary_color': '#CC0000', 'secondary_color': '#FFFFFF', 'reputation': 22, 'valuation': 320000, 'balance': 30000, 'weekly_wages': 15000, 'transfer_budget': 20000, 'stadium_capacity': 4097, 'stadium_level': 1, 'training_level': 1, 'medical_level': 1, 'youth_level': 1, 'board_type': 'FAN_OWNED', 'season_target': 'AVOID_RELEGATION'},
    {'name': 'Aldershot Town', 'stadium_name': 'EBB Stadium', 'primary_color': '#CC0000', 'secondary_color': '#003087', 'reputation': 27, 'valuation': 730000, 'balance': 62000, 'weekly_wages': 20000, 'transfer_budget': 42000, 'stadium_capacity': 7100, 'stadium_level': 2, 'training_level': 2, 'medical_level': 1, 'youth_level': 1, 'board_type': 'LOCAL', 'season_target': 'MID_TABLE'},
]

# ── MAIN GENERATOR ───────────────────────────────────

@transaction.atomic
def generate_world(session=None):
    # Leagues
    leagues_data = [
        ('Premier League', 1),
        ('Championship', 2),
        ('League One', 3),
        ('League Two', 4),
        ('National League', 5),
    ]
    leagues = []
    for name, tier in leagues_data:
        l = League.objects.create(name=name, tier=tier, country='England')
        leagues.append(l)

    club_pools = [PREMIER_LEAGUE_CLUBS, CHAMPIONSHIP_CLUBS, LEAGUE_ONE_CLUBS, LEAGUE_TWO_CLUBS, NATIONAL_LEAGUE_CLUBS]

    sponsor_ranges = {
        1: {'MAIN': (80000, 500000), 'SLEEVE': (30000, 150000), 'STADIUM': (100000, 800000)},
        2: {'MAIN': (10000, 80000), 'SLEEVE': (4000, 30000), 'STADIUM': (15000, 100000)},
        3: {'MAIN': (2000, 12000), 'SLEEVE': (800, 4000), 'STADIUM': (3000, 15000)},
        4: {'MAIN': (400, 2500), 'SLEEVE': (150, 800), 'STADIUM': (600, 3000)},
        5: {'MAIN': (80, 400), 'SLEEVE': (30, 150), 'STADIUM': (120, 600)},
    }

    for i, pool in enumerate(club_pools):
        league = leagues[i]
        tier = league.tier
        for cdata in pool:
            bt = cdata['board_type']
            club = Club.objects.create(
                name=cdata['name'],
                league=league,
                primary_color=cdata['primary_color'],
                secondary_color=cdata['secondary_color'],
                stadium_name=cdata['stadium_name'],
                reputation=cdata['reputation'],
                valuation=cdata['valuation'],
                balance=cdata['balance'],
                transfer_budget=cdata['transfer_budget'],
                weekly_wages=cdata['weekly_wages'],
                board_type=bt,
                season_target=cdata['season_target'],
                board_expectations=cdata['season_target'],
                board_patience=40 if bt == 'BILLIONAIRE' else 80,
                culture=map_board_type_to_culture(bt)
            )

            # Facilities
            ClubFacilities.objects.create(
                club=club,
                stadium_level=cdata['stadium_level'],
                stadium_capacity=cdata['stadium_capacity'],
                training_level=cdata['training_level'],
                medical_level=cdata['medical_level'],
                youth_level=cdata['youth_level']
            )

            # Squad
            squad_size = {1: 25, 2: 23, 3: 20, 4: 18, 5: 16}[tier]
            for _ in range(squad_size):
                generate_player(club, tier)

            # Manager
            generate_manager(club, tier)

            # Sponsors
            ranges = sponsor_ranges[tier]
            Sponsor.objects.create(club=club, name="Sponsor Main", sponsor_type='MAIN', amount=random.randint(*ranges['MAIN']), status='ACTIVE')
            Sponsor.objects.create(club=club, name="Sponsor Sleeve", sponsor_type='SLEEVE', amount=random.randint(*ranges['SLEEVE']), status='ACTIVE')
            Sponsor.objects.create(club=club, name="Sponsor Stadium", sponsor_type='STADIUM', amount=random.randint(*ranges['STADIUM']), status='ACTIVE')

            # Lineup
            auto_pick_lineup(club)

    # Free Agents
    for _ in range(200):
        tier = random.randint(1, 5)
        generate_player(None, tier)

    # Free Staff
    for _ in range(150):
        rating = random.randint(20, 85)
        role = random.choice(StaffRole.values)
        Staff.objects.create(
            name=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            role=role,
            rating=rating,
            salary=int(rating * 15),
            is_applicant=True
        )

    # Free Managers
    for tier in range(1, 6):
        for _ in range(20):
            generate_manager(None, tier)

    # GameState
    GameState.objects.create(
        pk=1,
        current_season=2024,
        current_week=1,
        is_transfer_window_open=True,
        personal_balance=1000000
    )
