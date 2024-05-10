
## Airtable Automation Scripts Install



### Add Automation

Open your base and select **Automations**.
![](/images/select_automations.png)

This opens the automations editor. 

Change the trigger to **When Record Updated**.

![](/images/record_updated.png)


Next, select the **Run Script** action. (Ignore the table required warning. It's stupid.)

![](/images/run_script.png)

### Add the Script

**Run Script** takes you to the script editor.

![](/images/script_editor.png)

Paste your script into the window. Wheeeee!

### Set Up Script Inputs

Airtable's only input mechanism for automation scripts is **Input Variables.**

You set them from the script editor:

![](/images/input_variables.png)


There are two pprimary types of input:
- Static text
- Context-sensitive values, such as the current record and its fields.

We use both.

![](/images/input_callouts.png)



For **GetCurrentRank.js** set the following:

- Current keyword as **keyword**
- Client web domain as **site**
- Data For SEO username as **username**
- Data for SEO password as **password**
- Current recordId as **recordid**

These values are called out in the script to make them obvious.


For **GetVolume.js**:

- Current keyword as **keyword**
- Current recordId as **recordid**
- Keywords everywhere API Token as **apitoken**