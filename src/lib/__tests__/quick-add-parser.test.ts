import { describe, it, expect } from 'vitest';
import { parseQuickAdd } from '../quick-add-parser';

describe('parseQuickAdd', () => {
  it('returns title only for plain text', () => {
    const result = parseQuickAdd('Buy milk');
    expect(result.title).toBe('Buy milk');
    expect(result.labels).toBeUndefined();
    expect(result.shop).toBeUndefined();
  });

  it('parses single label with #', () => {
    const result = parseQuickAdd('Buy milk #groceries');
    expect(result.title).toBe('Buy milk');
    expect(result.labels).toEqual(['groceries']);
  });

  it('parses quoted multi-word label', () => {
    const result = parseQuickAdd('Task #"multi word label"');
    expect(result.title).toBe('Task');
    expect(result.labels).toEqual(['multi word label']);
  });

  it('parses multiple labels', () => {
    const result = parseQuickAdd('Task #a #b');
    expect(result.title).toBe('Task');
    expect(result.labels).toEqual(['a', 'b']);
  });

  it('parses shop with $', () => {
    const result = parseQuickAdd('Bread $bakery');
    expect(result.title).toBe('Bread');
    expect(result.shop).toBe('bakery');
  });

  it('parses quoted shop name', () => {
    const result = parseQuickAdd('Cheese $"Albert Heijn"');
    expect(result.title).toBe('Cheese');
    expect(result.shop).toBe('Albert Heijn');
  });

  it('parses quantity with *', () => {
    const result = parseQuickAdd('Eggs *3');
    expect(result.title).toBe('Eggs');
    expect(result.quantity).toBe(3);
  });

  it('parses assignee with @', () => {
    const result = parseQuickAdd('Clean kitchen @Sara');
    expect(result.title).toBe('Clean kitchen');
    expect(result.assignee).toBe('Sara');
  });

  it('parses //morgen as tomorrow date', () => {
    const result = parseQuickAdd('Do homework //morgen');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];
    expect(result.title).toBe('Do homework');
    expect(result.dueDate).toContain(tomorrowISO);
  });

  it('parses //vandaag as today date', () => {
    const result = parseQuickAdd('Call dentist //vandaag');
    const todayISO = new Date().toISOString().split('T')[0];
    expect(result.title).toBe('Call dentist');
    expect(result.dueDate).toContain(todayISO);
  });

  it('parses !! as private', () => {
    const result = parseQuickAdd('!!Privé taak');
    expect(result.isPrivate).toBe(true);
    expect(result.title).toBe('Privé taak');
  });

  it('parses linked type and id with ~', () => {
    const result = parseQuickAdd('Note ~task:abc123');
    expect(result.title).toBe('Note');
    expect(result.linkedType).toBe('task');
    expect(result.linkedTo).toBe('abc123');
  });

  it('parses combined tokens', () => {
    const result = parseQuickAdd('Melk kopen $AH *2 #boodschappen @Sara //morgen');
    expect(result.title).toBe('Melk kopen');
    expect(result.shop).toBe('AH');
    expect(result.quantity).toBe(2);
    expect(result.labels).toEqual(['boodschappen']);
    expect(result.assignee).toBe('Sara');
    expect(result.dueDate).toBeDefined();
  });

  it('returns empty title for empty input', () => {
    const result = parseQuickAdd('');
    expect(result.title).toBe('');
  });

  it('returns empty title when only tokens present', () => {
    const result = parseQuickAdd('#label @Sara');
    expect(result.title).toBe('');
    expect(result.labels).toEqual(['label']);
    expect(result.assignee).toBe('Sara');
  });
});
