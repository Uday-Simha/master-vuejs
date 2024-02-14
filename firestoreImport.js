// Imports
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');
const fs = require('fs');
const tempFileName = `${__dirname}/data-temp.json`;

// Initialize Firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'YOUR_DATABASE_URL_HERE'
});

// Procedure
(async () => {
  const fileContents = fs.readFileSync(`${__dirname}/src/data.json`, 'utf8');
  const data = JSON.parse(fileContents);
  const transformed = transformDataForFirestore(data);
  fs.writeFileSync(tempFileName, JSON.stringify(transformed));
  await jsonToFirestore();
  fs.unlinkSync(tempFileName);
})();

// Helper Functions
// -------------------------------------

// JSON To Firestore
async function jsonToFirestore() {
  try {
    console.log('Firebase Initialized');

    const allData = require(tempFileName);

    for (const key of Object.keys(allData)) {
      const collection = admin.firestore().collection(key);

      for (const documentId of Object.keys(allData[key])) {
        const documentData = allData[key][documentId];
        await collection.doc(documentId).set(documentData);
      }
    }

    console.log('Upload Success');
  } catch (error) {
    console.log(error);
  }
}


// In order to preserve ids in data.json
// as ids in firestore
// must use keyed object (id being the key) instead of array of records
function transformDataForFirestore (data) {
  const collections = data;
  delete collections.stats;
  const collectionsById = {};
  Object.keys(collections).forEach((collectionKey) => {
    collectionsById[collectionKey] = {};
    const collection = collections[collectionKey];
    collection.forEach((record) => {
      collectionsById[collectionKey][record.id] = record;
      delete collectionsById[collectionKey][record.id].id;
    });
  });
  return collectionsById;
}
