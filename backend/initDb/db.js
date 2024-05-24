const { initCustomersJson } = require('./initCustomersJson');
const { initModeratorsJson } = require('./initModeratorsJson');
const { initRestosModifieXML } = require('./initRestosModifieXML');
const { initRestaurateurJson } = require('./initRestaurateurJson');
const { initRemovedCommentsTSV } = require('./initRemovedCommentsTSV');
const { initValidCommentsTSV } = require('./initValidCommentsTSV');


async function initDb(pool) {
    try {
        await initCustomersJson(pool);
        console.log('------------------------------------------');
        console.log('initCustomersJson initialized successfully');

        await initModeratorsJson(pool);
        console.log('------------------------------------------');
        console.log('initModeratorsJson initialized successfully');

        await initRestosModifieXML(pool);
        console.log('------------------------------------------');
        console.log('RestosModifieXML  initialized successfully');

        await initRestaurateurJson(pool);
        console.log('------------------------------------------');
        console.log('initRestaurateurJson initialized successfully');

        await initRemovedCommentsTSV(pool);
        console.log('------------------------------------------');
        console.log('initRemovedCommentsTSV initialized successfully');

        await initValidCommentsTSV(pool);
        console.log('------------------------------------------');
        console.log('initValidCommentsTSV initialized successfully');
        console.log('------------------------------------------');

        console.log('Data initdb inserted successfully');
        console.log('------------------------------------------');

    } catch (err) {
        console.error(err);
    }
}


module.exports = {
    initDb
};