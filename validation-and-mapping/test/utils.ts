export function assertBlock(done: MochaDone, assertionBlock: () => void) {
    try {
        assertionBlock();
        done();
    }
    catch (e) {
        done(e);
    }
}