import { readFilesRecursively } from "./fs";
import mock from 'mock-fs';

describe('readFilesRecursively()', () => {
    beforeEach(() => {
        mock({
          'some/fake/dir': {
            'test.txt': 'hello world'
          }
        });
      });
    
      afterEach(() => {
        mock.restore();
      });
    it('should return an array of files and folders', () => {
        const result = readFilesRecursively(process.cwd(), 6, []);
        expect(result).toBeInstanceOf(Array);
    });

    it('should return an array of files and folders with the correct structure', () => {
        const result = readFilesRecursively(process.cwd(), 6, []);
        expect(result[0]).toHaveProperty('type');
        expect(result[0]).toHaveProperty('path');
    });
}
);