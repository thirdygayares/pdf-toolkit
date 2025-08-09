import { describe, it, expect } from 'vitest';
import useTruncatedFilename from '../useTruncatedFilename';

describe('useTruncatedFilename', () => {
  const { truncate } = useTruncatedFilename();

  it('returns the original filename when short', () => {
    const short = 'short-file.txt';
    expect(truncate(short)).toBe(short);
  });

  it('truncates long filenames', () => {
    const long = 'This_is_a_really_long_filename_that_needs_truncation.pdf';
    const result = truncate(long);
    expect(result).toBe('This_is_a_really...needs_truncation.pdf');
    expect(result.length).toBeLessThanOrEqual(40);
  });

  it('handles filenames without extensions', () => {
    const name = 'filenamewithoutextension';
    expect(truncate(name)).toBe(name);
  });
});
