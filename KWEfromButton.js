////
/* Uncomment this and add string 'Bearer KWEtoken"

let auth =
*/
////
let table = base.getTable('Keywords');

// Prompt the user to pick a record
// If this script is run from a button field, this will use the button's record instead.
let record = await input.recordAsync('Select a record to use', table);

if (record) {
  // Customize this section to handle the selected record
  // You can use record.getCellValue("Field name") to access
  // cell values from the record
  output.text(`You selected this record: ${record.name}`);
  if (!record.getCellValueAsString('Volume')) {
    console.log(`${record.getCellValueAsString('Keyword')} has no volume`);

    let myHeaders = new Headers();
    myHeaders.append('Authorization', auth);
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    let urlencoded = new URLSearchParams();
    urlencoded.append('dataSource', 'cli');
    urlencoded.append('kw[]', record.getCellValueAsString('Keyword'));

    console.log(Object.fromEntries(urlencoded));

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
    console.log(responseJSON.data);
    for (const data of responseJSON.data) {
      console.log(data.vol);
      await table.updateRecordAsync(record.id, {
        Volume: data.vol,
      });
    }
  } else {
    console.log("volume is already filled out")
  }
} else {
  output.text('No record was selected');
}
