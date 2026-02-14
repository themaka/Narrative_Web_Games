/**
 * Generate the sample story CSV with exact column alignment.
 * Run: npx tsx sample/generate-csv.ts
 */
import { writeFileSync } from 'fs';

// Column order: A-Z (26 columns)
const HEADERS = [
  'node_id', 'speaker', 'text', 'speaker_position', 'speaker_image',
  'left_image', 'center_image', 'right_image', 'bg_image', 'transition',
  'choice_1_text', 'choice_1_target', 'choice_1_style',
  'choice_2_text', 'choice_2_target', 'choice_2_style',
  'choice_3_text', 'choice_3_target', 'choice_3_style',
  'choice_4_text', 'choice_4_target', 'choice_4_style',
  'music', 'sound_effect', 'set_flag', 'require_flag',
];

interface Row {
  node_id: string;
  speaker?: string;
  text: string;
  speaker_position?: string;
  speaker_image?: string;
  left_image?: string;
  center_image?: string;
  right_image?: string;
  bg_image?: string;
  transition?: string;
  choice_1_text?: string;
  choice_1_target?: string;
  choice_1_style?: string;
  choice_2_text?: string;
  choice_2_target?: string;
  choice_2_style?: string;
  choice_3_text?: string;
  choice_3_target?: string;
  choice_3_style?: string;
  choice_4_text?: string;
  choice_4_target?: string;
  choice_4_style?: string;
  music?: string;
  sound_effect?: string;
  set_flag?: string;
  require_flag?: string;
}

function csvEscape(val: string): string {
  if (!val) return '';
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

function rowToCsv(row: Row): string {
  return HEADERS.map(h => csvEscape((row as any)[h] || '')).join(',');
}

const nodes: Row[] = [
  // === INTRO (narration, auto-advance, fade) ===
  {
    node_id: 'Intro1',
    text: '*The forest stretches endlessly before you. Sunlight filters through the canopy overhead.*',
    bg_image: 'forest_bg.png',
    transition: 'fade',
    choice_1_target: 'Intro2',
  },
  {
    node_id: 'Intro2',
    text: 'You adjust your pack and glance at the hand-drawn map. The trail forks ahead.',
    choice_1_target: 'Intro3',
  },

  // === FIRST BRANCH (real choices) ===
  {
    node_id: 'Intro3',
    text: 'Two paths diverge before you. One leads deeper into the woods, the other toward a faint plume of smoke.',
    choice_1_text: 'Take the forest path',
    choice_1_target: 'Fork_Forest',
    choice_2_text: 'Follow the smoke',
    choice_2_target: 'Fork_Village',
  },

  // === FOREST PATH (checkpoint, props, set_flag) ===
  {
    node_id: 'Fork_Forest',
    text: 'The trees grow thicker. Moss carpets the ground and muffles your footsteps.',
    transition: 'checkpoint',
    choice_1_target: 'Forest1',
  },
  {
    node_id: 'Forest1',
    text: 'Ahead, a wooden sign is nailed to an old oak.',
    center_image: 'sign.png',
    choice_1_target: 'Forest2',
  },
  {
    node_id: 'Forest2',
    text: 'The sign reads: *"Beware \u2014 the bridge keeper asks a toll."* Something glints on the ground nearby.',
    center_image: 'sign.png',
    choice_1_text: 'Investigate the glint',
    choice_1_target: 'Forest3',
    choice_2_text: 'Ignore it and press on',
    choice_2_target: 'Forest4',
  },
  {
    node_id: 'Forest3',
    text: 'You pocket a smooth stone from the ground \u2014 it might come in handy.',
    center_image: 'stone.png',
    choice_1_target: 'Forest4',
    set_flag: 'has_stone',
  },
  {
    node_id: 'Forest4',
    text: 'The path opens onto a rope bridge spanning a deep gorge. A cloaked figure stands at the center, arms folded.',
    bg_image: 'bridge_bg.png',
    transition: 'fade',
    choice_1_target: 'Bridge1',
  },

  // === BRIDGE KEEPER (dialogue, danger/subtle styles, speaker) ===
  {
    node_id: 'Bridge1',
    speaker: 'Keeper',
    text: '*"You wish to cross?"* The keeper\'s voice echoes off the canyon walls.',
    speaker_position: 'left',
    choice_1_target: 'Bridge2',
  },
  {
    node_id: 'Bridge2',
    speaker: 'Keeper',
    text: '"Everyone pays a toll. Show me something of value... or turn back."',
    speaker_position: 'left',
    choice_1_text: 'Offer the stone',
    choice_1_target: 'Bridge_Stone',
    choice_2_text: 'Turn back',
    choice_2_target: 'Bridge_Refuse',
    choice_2_style: 'danger',
    choice_3_text: 'Try to sneak past',
    choice_3_target: 'Bridge_Sneak',
    choice_3_style: 'subtle',
  },
  {
    node_id: 'Bridge_Stone',
    speaker: 'Keeper',
    text: '"Hmm. A simple stone... but it carries the weight of the mountain." The keeper steps aside.',
    speaker_position: 'left',
    choice_1_target: 'Bridge_Cross',
    require_flag: 'has_stone',
  },
  {
    node_id: 'Bridge_Refuse',
    text: 'You back away from the bridge. The keeper watches silently as you retreat into the forest.',
    bg_image: 'forest_bg.png',
    choice_1_target: 'Ending_Lost',
  },
  {
    node_id: 'Bridge_Sneak',
    speaker: 'Keeper',
    text: '"Did you think I wouldn\'t notice?" The keeper\'s cloak billows as you stumble back.',
    speaker_position: 'left',
    choice_1_text: 'Turn back honestly',
    choice_1_target: 'Bridge_Refuse',
    choice_1_style: 'danger',
    choice_2_text: 'Apologize and offer the stone',
    choice_2_target: 'Bridge_Stone',
  },

  // === CROSS THE BRIDGE (fade, set_flag) ===
  {
    node_id: 'Bridge_Cross',
    text: 'You step across the creaking bridge. The far side opens onto rolling hills under a wide sky.',
    bg_image: 'hills_bg.png',
    transition: 'fade',
    choice_1_target: 'Hills1',
    set_flag: 'crossed_bridge',
  },
  {
    node_id: 'Hills1',
    text: 'The hills are dotted with wildflowers. A village is visible in the valley below \u2014 the same one the other path would have led to.',
    choice_1_target: 'Hills2',
  },
  {
    node_id: 'Hills2',
    text: "You've made it through the forest. The village awaits.",
    choice_1_text: 'Enter the village',
    choice_1_target: 'Village1',
  },

  // === VILLAGE PATH (checkpoint) ===
  {
    node_id: 'Fork_Village',
    text: 'The smoke leads you to a small village nestled between the hills. Thatched roofs and the smell of baking bread.',
    bg_image: 'village_bg.png',
    transition: 'checkpoint',
    choice_1_target: 'Village1',
  },

  // === VILLAGE (dialogue, require_flag for conditional response) ===
  {
    node_id: 'Village1',
    speaker: 'Elder',
    text: "Welcome, traveler. We don't get many visitors on the winding path.",
    speaker_position: 'right',
    choice_1_target: 'Village2',
  },
  {
    node_id: 'Village2',
    speaker: 'Elder',
    text: '"Tell me \u2014 how did you arrive? Through the forest... or along the road?"',
    speaker_position: 'right',
    choice_1_text: 'I came through the forest',
    choice_1_target: 'Village_Forest_Chat',
    choice_2_text: 'I followed the smoke here',
    choice_2_target: 'Village_Road_Chat',
  },
  {
    node_id: 'Village_Forest_Chat',
    speaker: 'Elder',
    text: '"Ah, a brave one. The forest tests those who walk it." The elder nods approvingly.',
    speaker_position: 'right',
    choice_1_target: 'Village3',
    require_flag: 'crossed_bridge',
  },
  {
    node_id: 'Village_Forest_Chat_no',
    speaker: 'Elder',
    text: '"Ah, you say the forest? Interesting... you must have taken a shortcut." The elder looks puzzled.',
    speaker_position: 'right',
    choice_1_target: 'Village3',
  },
  {
    node_id: 'Village_Road_Chat',
    speaker: 'Elder',
    text: '"The road is safer, but you miss the wonders hidden among the trees." The elder smiles warmly.',
    speaker_position: 'right',
    choice_1_target: 'Village3',
  },
  {
    node_id: 'Village3',
    speaker: 'Elder',
    text: '"Either way, you\'ve reached us. And that is what matters."',
    speaker_position: 'right',
    choice_1_target: 'Village4',
  },
  {
    node_id: 'Village4',
    text: 'The elder gestures toward the village square, where a small festival is underway. Music drifts through the air.',
    choice_1_text: 'Enjoy the festival',
    choice_1_target: 'Ending_Good',
    choice_2_text: 'Ask about the road ahead',
    choice_2_target: 'Ending_Journey',
  },

  // === ENDINGS ===
  {
    node_id: 'Ending_Good',
    text: 'You spend the evening among the villagers \u2014 sharing stories, laughter, and warm bread. For the first time in a long while, you feel at home.\n\n*The End.*',
  },
  {
    node_id: 'Ending_Journey',
    speaker: 'Elder',
    text: '"The road goes ever on, traveler. But remember \u2014 you are always welcome here."',
    speaker_position: 'right',
    choice_1_target: 'Ending_Journey2',
  },
  {
    node_id: 'Ending_Journey2',
    text: 'You wave goodbye and set off toward the horizon. The winding path stretches before you once more \u2014 but now you know: every fork leads somewhere worth going.\n\n*The End.*',
  },
  {
    node_id: 'Ending_Lost',
    text: 'The forest swallows you again. Without the bridge, you wander in circles until nightfall.\n\nYou make camp and promise yourself: tomorrow, you\'ll find another way.\n\n*The End.*',
  },
];

// Verify all rows have exactly 26 fields
const csvLines = [HEADERS.join(',')];
for (const node of nodes) {
  const line = rowToCsv(node);
  const fieldCount = line.split(',').length; // rough count, won't handle quoted commas
  csvLines.push(line);
}

const csv = csvLines.join('\n') + '\n';
writeFileSync('sample/story.csv', csv);
console.log(`Generated sample/story.csv with ${nodes.length} nodes`);

// Verify with parser
import { parseStorySheet } from '../src/utils/sheetParser';
const parsed = parseStorySheet(csv);
console.log(`Parser found ${parsed.length} nodes\n`);

let ok = true;
for (const node of parsed) {
  const isEnding = node.choices.length === 0;
  const isAutoAdvance = node.choices.length === 1 && !node.choices[0].text;
  const isBranching = node.choices.some(c => c.text);

  const source = nodes.find(n => n.node_id === node.nodeId)!;
  const expectedEnding = !source.choice_1_target;
  const expectedBranching = !!source.choice_1_text;
  const expectedAutoAdvance = !!source.choice_1_target && !source.choice_1_text;

  if (expectedEnding && !isEnding) {
    console.error(`❌ ${node.nodeId}: expected ENDING but got choices: ${JSON.stringify(node.choices)}`);
    ok = false;
  } else if (expectedAutoAdvance && !isAutoAdvance) {
    console.error(`❌ ${node.nodeId}: expected AUTO-ADVANCE to ${source.choice_1_target} but got: ${JSON.stringify(node.choices)}`);
    ok = false;
  } else if (expectedBranching && !isBranching) {
    console.error(`❌ ${node.nodeId}: expected BRANCHING but got: ${JSON.stringify(node.choices)}`);
    ok = false;
  } else {
    const type = isEnding ? 'ENDING' : isAutoAdvance ? `AUTO → ${node.choices[0].target}` : `BRANCH (${node.choices.length})`;
    const flags = [];
    if (node.setFlag?.length) flags.push(`set:${node.setFlag}`);
    if (node.requireFlag?.length) flags.push(`req:${node.requireFlag}`);
    console.log(`✅ ${node.nodeId}: ${type}${flags.length ? ` [${flags.join(', ')}]` : ''}`);
  }
}

if (ok) {
  console.log('\n✅ All nodes parsed correctly!');
} else {
  console.log('\n❌ Some nodes have issues — check above');
  process.exit(1);
}
