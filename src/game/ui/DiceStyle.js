const VALUE_STYLES = {
  1: {
    name: 'soft blue',
    fill: '#dcecff',
    stroke: '#6f9fbd',
    pip: '#173958',
    glow: '#9fc5eb'
  },
  2: {
    name: 'teal green',
    fill: '#dff4e9',
    stroke: '#55a982',
    pip: '#163f32',
    glow: '#8bd0b0'
  },
  3: {
    name: 'warm gold',
    fill: '#fff3bf',
    stroke: '#d7a62f',
    pip: '#4e3908',
    glow: '#f2cf65'
  },
  4: {
    name: 'soft orange',
    fill: '#ffe4cb',
    stroke: '#df8a45',
    pip: '#5a2d0d',
    glow: '#efb074'
  },
  5: {
    name: 'coral red',
    fill: '#ffe0dc',
    stroke: '#df6758',
    pip: '#5e2019',
    glow: '#ec9a8f'
  },
  6: {
    name: 'calm purple',
    fill: '#eadfff',
    stroke: '#8f76c8',
    pip: '#35235f',
    glow: '#b8a5e6'
  },
  star: {
    name: 'star gold',
    fill: '#fff2ad',
    stroke: '#d09416',
    pip: '#725207',
    glow: '#f4bf45'
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
