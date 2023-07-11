let table = base.getTable('Core Site Indexed Content');
let result = await table.selectRecordsAsync({
  fields: ['URL', 'Meta Title', 'H1 Title'],
});

function getH1Title(htmlAsText) {
  let h1StartingLocation = htmlAsText.indexOf('<h1');
  let h1TagEndLocation =
    htmlAsText.substring(h1StartingLocation).indexOf('>') + h1StartingLocation;
  let h1CloseLocation =
    htmlAsText.substring(h1TagEndLocation).indexOf('</h1') + h1TagEndLocation;

  return htmlAsText.substring(h1TagEndLocation + 1, h1CloseLocation);
}

function getMetaTitle(htmlAsText) {
  let titleStartingLocation = htmlAsText.indexOf('<title>');
  let titleTagClosingLocation = htmlAsText.indexOf('>', titleStartingLocation);
  let titleCloseLocation = htmlAsText.indexOf(
    '</title',
    titleTagClosingLocation,
  );

  return htmlAsText.substring(titleTagClosingLocation + 1, titleCloseLocation);
}

function GEtMetaDescription(htmlAsText) {}

let records = result.records;
for (let record of records.filter((r) => r.getCellValue('URL'))) {
  try {
    let h1Title = record.getCellValue('H1 Title');

    if (!record.getCellValue('H1 Title')) {
      console.log('H1 title empty');
      let response = await remoteFetchAsync(record.getCellValue('URL'));
      if (response.ok) {
        let promise = response.text();
        let html = await promise.then((text) => {
          return text;
        });

        let h1Title = getH1Title(html);
        let metaTitle = getMetaTitle(html);

        table.updateRecordAsync(record, {
          'H1 Title': h1Title,
          'Meta Title': metaTitle,
        });
      }
    }
  } catch {
    console.log('oh no');
  }
}
