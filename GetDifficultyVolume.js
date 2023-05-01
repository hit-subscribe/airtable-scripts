// API stuff
////
/* Uncomment this and add in authorizations/variables

let KWEAuth = 'Bearer KWEtoken'
let DFSEOAuth= 'Bearer DFStoken'
let VolumeFieldName = 'Volume'
let DifficultyFieldName = 'Difficulty'
*/
////

// This function will look at the query to see which entries are missing the respective 'field'
function GenerateArray(queryResult, field) {
  let keywordList = [];
  for (let record of queryResult.records) {
    if (!record.getCellValueAsString(field)) {
      console.log(
        `${record.getCellValueAsString('Keyword')} has no ${field} value`,
      );
      if (record.getCellValueAsString('Keyword') != '') {
        keywordList.push(record.getCellValueAsString('Keyword'));
      }
    }
  }
  return keywordList;
}

async function KeywordsEverywhere(KeywordList) {
  if (KeywordList > 100) {
    console.log(
      "Keyword list is too long for Keyword Everywhere's API, will only get the first 100. Run again to get the rest",
    );
  }
  let trimmedKeywordList = KeywordList.slice(0, 99);
  console.log(trimmedKeywordList, 'trimed');
  let myHeaders = new Headers();
  myHeaders.append('Authorization', KWEAuth);
  myHeaders.append('Accept', 'application/json');
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  let urlencoded = new URLSearchParams();
  urlencoded.append('dataSource', 'gkp');
  urlencoded.append('country', 'us');
  urlencoded.append('currency', 'USD');
  for (const keyword of trimmedKeywordList) {
    urlencoded.append('kw[]', keyword);
  }

  console.log(Object.fromEntries(urlencoded));
  console;
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  };

  console.log(urlencoded);

  let response = await fetch(
    'https://api.keywordseverywhere.com/v1/get_keyword_data',
    requestOptions,
  );
  let responseJSON = await response.json();
  return responseJSON.data;
}

async function DataForSEO(KeywordList) {
  let myHeaders = new Headers();
  myHeaders.append('Authorization', DFSEOAuth);
  myHeaders.append('Content-Type', 'application/json');

  let raw = JSON.stringify([
    {
      keywords: KeywordList,
      location_code: 2840,
      language_code: 'en',
    },
  ]);

  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  let response = await fetch(
    'https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live',
    requestOptions,
  );
  let responseJSON = await response.json();
  console.log(responseJSON);
  const {
    tasks: [
      {
        result: [{ items }],
      },
    ],
  } = responseJSON;

  return items;
}

// Change this name to use a different table
let table = base.getTable('Keywords');

let queryResult = await table.selectRecordsAsync({
  fields: ['Keyword', VolumeFieldName, DifficultyFieldName],
});
let difficultyLookup = await GenerateArray(queryResult, DifficultyFieldName);
let volumeLookup = await GenerateArray(queryResult, VolumeFieldName);

console.log(volumeLookup);
/// update fields with difficulty

if (difficultyLookup.length !== 0) {
  try {
    let DFSresults = [];
    DFSresults = await DataForSEO(difficultyLookup);
    for (const item of DFSresults) {
      const keyword = item.keyword?.toLowerCase();
      if (!keyword) {
        console.log('No keyword found in item:', item);
        continue;
      }

      const match = queryResult.records.find(
        (rec) => rec.getCellValue('Keyword')?.toLowerCase() === keyword,
      );
      if (!match) {
        console.log('No match found for keyword:', keyword);
        continue;
      }

      const updates = {
        [DifficultyFieldName]: item.keyword_difficulty ?? 0,
      };
      await table.updateRecordAsync(match.id, updates);
      console.log('Match found for keyword:', keyword);
    }
  } catch (error) {
    console.log(
      'An error occurred while fetching or processing the data:',
      error,
    );
  }
} else {
  console.log('Difficulty data already filled in, moving on to the next step');
}

/// update volume
//console.log(KWEResults);
if (volumeLookup.length !== 0) {
  try {
    let keywordResults = [];

    keywordResults = await KeywordsEverywhere(volumeLookup);

    for (const result of keywordResults) {
      const matchingRecord = queryResult.records.find((record) => {
        const keyword = record.getCellValue('Keyword')?.toLowerCase();
        return keyword === result.keyword?.toLowerCase();
      });

      if (matchingRecord) {
        const volume = result.vol ?? 0;
        const updates = { [VolumeFieldName]: volume };
        await table.updateRecordAsync(matchingRecord.id, updates);
        console.log(`Updated record ${matchingRecord.id}`);
      } else {
        console.log(`No matching record for ${result.keyword}`);
      }
    }

    // Other code can be run here
  } catch (error) {
    console.log(
      'An error occurred while fetching or processing the data:',
      error,
    );
  }
} else {
  console.log('Volume data already filled in');
}
