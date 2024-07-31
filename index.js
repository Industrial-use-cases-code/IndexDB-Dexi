// Open the database
 function openIndexedDB(dbName, version, storeConfigs) {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, version);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            storeConfigs.forEach(config => {
                if (!db.objectStoreNames.contains(config.name)) {
                    db.createObjectStore(config.name, { keyPath: config.keyPath, autoIncrement: config.autoIncrement });
                }
            });
        };

        request.onsuccess = function (event) {
            console.log(`${dbName} opened successfully`);
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            console.error(`${dbName} failed to open`, event);
            reject(event);
        };
    });
}

// Add data to IndexedDB
 async function addData(db, storeName, data) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    return tx.complete;
}

// Get data from IndexedDB
 async function getData(db, storeName, id) {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.get(id);
}

// Get all unsynced data
 async function getAllData(db, storeName) {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return store.getAll();
}

// Mark data for sync
 async function markDataForSync(db, storeName, data) {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    return tx.complete;
}

export default {openIndexedDB, addData, getData, getAllData, markData}

// Example usage
(async () => {
    const storeConfigs = [
        { name: 'posts', keyPath: 'id' },
        { name: 'sync-posts', keyPath: 'id', autoIncrement: true },
        { name: 'sales', keyPath: 'id' },
        { name: 'products', keyPath: 'id', autoIncrement: true }
    ];

    const db = await openIndexedDB('localdb', 1, storeConfigs);

    // Adding a post
    await addData(db, 'posts', { id: 1, title: 'My Post', content: 'Content of the post' });

    // Getting a post
    const post = await getData(db, 'posts', 1);
    console.log('Post:', post);

    // Marking post for sync
    await markDataForSync(db, 'sync-posts', { id: 1, title: 'My Post', content: 'Content of the post' });

    // Getting all unsynced posts
    const unsyncedPosts = await getAllData(db, 'sync-posts');
    console.log('Unsynced Posts:', unsyncedPosts);
})();
