

// Yes, Airtable lacks a base64 encoder. 
function btoa(str) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    let char1, char2, char3;
    
    while (i < str.length) {
      char1 = str.charCodeAt(i++);
      char2 = str.charCodeAt(i++);
      char3 = str.charCodeAt(i++);
      
      result += characters.charAt(char1 >> 2);
      result += characters.charAt(((char1 & 3) << 4) | (char2 >> 4));
      result += characters.charAt(((char2 & 15) << 2) | (char3 >> 6));
      result += characters.charAt(char3 & 63);
    }
    
    return result;
  }
  
  async function CannibalizationCheck(keyword, username, password) {
  
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/application/json');
    myHeaders.set('Authorization', 'Basic ' + btoa(username + ":" + password));
  
  
    const requestOptions = {
      method: 'post',
      headers: myHeaders,
      body: JSON.stringify([{
        keyword: keyword,
        location_code: "2840",
        language_code: "en" 
      }])
    };
  
  
    let response = await fetch(
      'https://api.dataforseo.com/v3/serp/google/organic/live/regular',
      requestOptions,
    );
    let responseJSON = await response.json();
    console.log(responseJSON);
    return responseJSON;
  }
  
  
  let table = base.getTable("Keywords");
  
  let inputConfig = input.config();
  let keyword = `${inputConfig.keyword}`
  let site = `${inputConfig.site}`
  let username = `${inputConfig.username}`
  let password = `${inputConfig.password}`
  let recordId = `${inputConfig.recordid}`
  
  let result = await CannibalizationCheck(keyword, username, password)
  
  if (result.status_message == "Ok.") {
  
    let serpResults = result['tasks'][0].result[0].items;
    let occurrence = serpResults.find(entry  => entry.domain.includes(site));
        if (typeof occurrence !== 'undefined') {
          await table.updateRecordAsync(recordId, {
              "Current Ranking": parseInt(occurrence.rank_absolute)
          });
        } else {
          await table.updateRecordAsync(recordId, {
              "Current Ranking": 1000
          });
        }
  
  } else {
    // Hmmmm
    console.log("Received error from data4seo.com");
  }
  
  
  