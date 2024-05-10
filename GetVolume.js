
async function KeywordsEverywhere(keyword, token) {
  
    let myHeaders = new Headers();
    myHeaders.append('Authorization', "Bearer " + token);
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  
    let urlencoded = new URLSearchParams();
    urlencoded.append('dataSource', 'gkp');
    urlencoded.append('kw[]', keyword);
  
    console.log(Object.fromEntries(urlencoded));
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
    };
  
  
    let response = await fetch(
      'https://api.keywordseverywhere.com/v1/get_keyword_data',
      requestOptions,
    );
    let responseJSON = await response.json();
    console.log(responseJSON);
    return responseJSON.data[0].vol;
  }
  
  let inputConfig = input.config();
  let table = base.getTable("Keywords");
  
  let recordId = `${inputConfig.recordId}`
  
  let result = await KeywordsEverywhere(`${inputConfig.keyword}`, `${inputConfig.apitoken}`)
  
  
  let updated = await table.updateRecordAsync(recordId, {
    "Volume": result
  });
  
  