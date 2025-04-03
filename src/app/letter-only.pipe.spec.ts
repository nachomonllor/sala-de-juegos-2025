import { LetterOnlyPipe } from './letter-only.pipe';

describe('LetterOnlyPipe', () => {
  it('create an instance', () => {
    const pipe = new LetterOnlyPipe();
    expect(pipe).toBeTruthy();
  });
});
