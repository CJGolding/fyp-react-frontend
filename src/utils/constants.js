export const NODE_WIDTH = 70;
export const NODE_HEIGHT = 50;
export const NODE_SPACING = 8;
export const ROW_SPACING = 25;
export const VERTICAL_SPACING = 60;
export const NODE_SIZE = 50;
export const HORIZONTAL_SPACING = 80;
export const FIXED_NODES_PER_ROW = 10;
export const ANIMATION_DELAY_MS = 1000;

export const NODE_SIZE_CONSTANT = 1;
export const SIBLING_DISTANCE = 0.5;
export const TREE_DISTANCE = 0.5;

export const BACKEND_URL_PREFIX = 'localhost:8000';

export const SimulationColours = {
    DEFAULT: '#E8E8E8',
    INVISIBLE: '#FFFFFF00',
    WINDOW: '#90CAF9',
    ANCHOR: '#9C27B0',
    TEAM_X: '#2196F3',
    CREATED: '#2196F3',
    TEAM_Y: '#FFC107',
    INSERTED: '#8BC34A',
    REMOVED: '#F44336',
    TEXT_DARK: '#000000',
    TEXT_LIGHT: '#FFFFFF'
};

export const X_AXIS_LABEL = 'Step Number';
export const STATISTIC_COLOURS = [
    '#4BC0C0FF',
    '#FF6384FF',
    '#36A2EBFF',
    '#FFCE56FF',
    '#9966FFFF'
];

export const MatchmakingMode = {
    UNRESTRICTED: 'Unrestricted',
    TIME_SENSITIVE: 'Time-Sensitive'
};

export const DisplayTabs = {
    CONFIG: 'CONFIG',
    SIMULATION: 'SIMULATION',
    STATS: 'STATS'
};

export const PLAYER_QUEUE_LEGEND = [
    {label: 'Default', fill: SimulationColours.DEFAULT, text: SimulationColours.TEXT_DARK},
    {label: 'Window', fill: SimulationColours.WINDOW, text: SimulationColours.TEXT_DARK},
    {label: 'Anchor', fill: SimulationColours.ANCHOR, text: SimulationColours.TEXT_LIGHT},
    {label: 'Team X', fill: SimulationColours.TEAM_X, text: SimulationColours.TEXT_LIGHT},
    {label: 'Team Y', fill: SimulationColours.TEAM_Y, text: SimulationColours.TEXT_DARK},
    {label: 'Added', fill: SimulationColours.INSERTED, text: SimulationColours.TEXT_DARK},
    {label: 'Removed', fill: SimulationColours.REMOVED, text: SimulationColours.TEXT_LIGHT}
];


export const GAME_HEAP_LEGEND = [
    {label: 'Default', fill: SimulationColours.DEFAULT, text: SimulationColours.TEXT_DARK},
    {label: 'Root', fill: SimulationColours.ANCHOR, text: SimulationColours.TEXT_LIGHT},
    {label: 'Added', fill: SimulationColours.INSERTED, text: SimulationColours.TEXT_DARK},
    {label: 'Removed', fill: SimulationColours.REMOVED, text: SimulationColours.TEXT_LIGHT},
    {label: 'Created', fill: SimulationColours.CREATED, text: SimulationColours.TEXT_LIGHT}
];
