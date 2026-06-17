const VALUE_STYLES = {
  1: {
    name: 'soft blue',
    fill: '#4f9de8',
    highlight: '#9fd4ff',
    side: '#2f6fbd',
    stroke: '#235a9c',
    rim: '#bee3ff',
    pip: '#fff8ec',
    pipShadow: '#244b76',
    shadow: '#17385f',
    glow: '#8fc8ff'
  },
  2: {
    name: 'teal green',
    fill: '#25b9b0',
    highlight: '#8cf1e9',
    side: '#16847e',
    stroke: '#116d68',
    rim: '#b7fff8',
    pip: '#fff8ec',
    pipShadow: '#10534f',
    shadow: '#0e4644',
    glow: '#7ee7de'
  },
  3: {
    name: 'sunny yellow',
    fill: '#f7c94a',
    highlight: '#ffec9a',
    side: '#bd861d',
    stroke: '#8b6515',
    rim: '#fff2b5',
    pip: '#fff9ee',
    pipShadow: '#6e5015',
    shadow: '#765212',
    glow: '#ffdb70'
  },
  4: {
    name: 'soft orange',
    fill: '#ff8a23',
    highlight: '#ffc176',
    side: '#c9500d',
    stroke: '#a8410a',
    rim: '#ffd4a2',
    pip: '#fff8ec',
    pipShadow: '#843009',
    shadow: '#80340b',
    glow: '#ffb15f'
  },
  5: {
    name: 'coral red',
    fill: '#f05b55',
    highlight: '#ffaaa2',
    side: '#b93037',
    stroke: '#9b2730',
    rim: '#ffd0ca',
    pip: '#fff8ec',
    pipShadow: '#84262c',
    shadow: '#722229',
    glow: '#ff948b'
  },
  6: {
    name: 'calm purple',
    fill: '#7b4cc1',
    highlight: '#b79ae9',
    side: '#57328f',
    stroke: '#462574',
    rim: '#ddccff',
    pip: '#fff8ec',
    pipShadow: '#392164',
    shadow: '#2c1a50',
    glow: '#b596ef'
  },
  star: {
    name: 'treasure amber star',
    fill: '#e49a12',
    highlight: '#ffe18a',
    side: '#a85f06',
    stroke: '#563003',
    rim: '#fff0a0',
    pip: '#fff8cc',
    pipShadow: '#8f5204',
    shadow: '#5f3604',
    glow: '#ffc84d',
    starGlow: '#fff0a8',
    sparkle: '#ffe58a',
    starScale: 1.18,
    special: true
  }
};

function normalizeValue(value) {
  return value === 'star' ? 'star' : Number(value);
}

export class DiceStyle {
  static forValue(value) {
    return VALUE_STYLES[normalizeValue(value)] ?? VALUE_STYLES[1];
  }

  static hexToNumber(hex) {
    return Number.parseInt(hex.replace('#', ''), 16);
  }
}
