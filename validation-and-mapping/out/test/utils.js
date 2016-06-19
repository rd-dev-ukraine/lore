"use strict";
function assertBlock(done, assertionBlock) {
    try {
        assertionBlock();
        done();
    }
    catch (e) {
        done(e);
    }
}
exports.assertBlock = assertBlock;
//# sourceMappingURL=utils.js.map