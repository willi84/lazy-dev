# jsdoc tests
1. lint @todo und // TODO comments
2. lint if the block has 2-3 lines till function
3. lint wrong comments in the block

```
/**
 * 🎯 get base http item for url
 * @param {string} url ➡️ The URL to check.
 * @param {number} [timeout] ➡️ Optional timeout in seconds.
 * @returns {HeaderItem} 📤 The parsed HTTP status object.
//  * @returns {HTTPStatusBase} 📤 The parsed HTTP status object. <= here
 */
 ```
 4. file main header comment
```
/**
 * 🎯 A utility class for http handling
 * @module backend/_shared/HTTP
 * @example getResponse('https://www.domain.de');
 * @version 0.0.1
 * @date 2026-09-19
 * @lastModified 2026-09-20
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
 ```

 5. check for valid types: standard types and types from all typing files
 6. test for all params and returns and say when they are missing


 # spec tests
 1. test for FN()
 2. test for valid and invalid cases
 3. test for myfunc() in describe block