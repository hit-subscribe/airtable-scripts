let table = base.getTable('Content Map');
let result = await table.selectRecordsAsync({fields: ['URL', 'Tags']});

function getTags(url) {
    let tokens = url.split("/");
    const firstPathToken = 3;

    return tokens.slice(firstPathToken, tokens.length - 2);
}

function getSlugTitle(url) {
    let tokens = url.split("/").filter(e => e);
    return tokens.length > 3 ? tokens[tokens.length - 1] : '';
}

function doesTagsFieldContain(tagName) {
    let existingTags = table.getField("Tags").options.choices.map(o => o.name);
    return existingTags.includes(tagName);
}

async function addOptionToTags(tag) {

    console.log("Adding " + tag);
    const field = table.getField('Tags');
    await field.updateOptionsAsync({
        choices: [
            ...field.options.choices,
            {name: tag},
        ],
    });
}

let records = result.records;

for(let record of records.filter(r => r.getCellValue("URL"))) {
        let url = record.getCellValue("URL");
        let tags = getTags(url); 
        let slugTitle = getSlugTitle(url);
        
        console.log("Tags is " + tags);
        for(const tag of tags.filter(t => !doesTagsFieldContain(t))) {
            await addOptionToTags(tag);
        }

        await table.updateRecordAsync(record, {"Tags": tags.map(t => {return {name:t}}) , "Slug Title": slugTitle});
}