const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeStatus,
  buildSlotId,
  parseBatchPayload,
  summarizeSlots
} = require('./slotService');

test('normalizeStatus maps ESP32 numeric statuses', () => {
  assert.equal(normalizeStatus(0), 'vacant');
  assert.equal(normalizeStatus(1), 'occupied');
  assert.equal(normalizeStatus('empty'), 'vacant');
  assert.equal(normalizeStatus('occupied'), 'occupied');
});

test('buildSlotId creates stable block-prefixed ids', () => {
  assert.deepEqual(buildSlotId({ block: 'p', slotNumber: '3' }), {
    block: 'P',
    slotNumber: 3,
    slotId: 'P3'
  });
});

test('parseBatchPayload supports thesis ESP32 batch payload', () => {
  const parsed = parseBatchPayload({
    device_id: 'ESP32-001',
    timestamp: 1714400000,
    slots: [
      { id: 1, status: 0 },
      { id: 2, status: 1 }
    ]
  });

  assert.equal(parsed.deviceId, 'ESP32-001');
  assert.equal(parsed.slots.length, 2);
  assert.equal(parsed.slots[0].slotId, 'A1');
  assert.equal(parsed.slots[0].status, 'vacant');
  assert.equal(parsed.slots[1].status, 'occupied');
});

test('summarizeSlots counts slot states for the mobile dashboard', () => {
  assert.deepEqual(
    summarizeSlots([
      { status: 'vacant' },
      { status: 'occupied' },
      { status: 'occupied' },
      { status: 'error' }
    ]),
    { total: 4, vacant: 1, occupied: 2, error: 1 }
  );
});
