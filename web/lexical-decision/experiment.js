let jsPsych = initJsPsych();

let timeline = [];

let welcomeTrial = {
    type: jsPsychHtmlKeyboardResponse, 
    stimulus: `
    <h1>Welcome to the Lexical Decision Task!</h1> 
    <p>In this experiment, you will be shown a series of characters and asked to categorize whether the characters make up a word or not.</p>
    <p>There are three parts to this experiment.</p>
    <p>Press SPACE to proceed to the first part.</p>
    `,
    choices: [' '], 
};
timeline.push(welcomeTrial);

for (let block of blocks) {
    let blockIntroTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
        	<h1>${block.title}</h1>
        	<p>You are about to see a series of ${block.count} characters.</p>
    		<p>If the characters make up a word, press the F key.</p>
    		<p>If the characters do not make up a word, press the J key.</p>
    		<p>Press SPACE to begin.</p>
        	`,
        choices: [' '],
    };
    timeline.push(blockIntroTrial);
    // shuffle conditions within block
    blockConditions = jsPsych.randomization.repeat(block.conditions, 1);

    for (let condition of blockConditions) {
    	let conditionTrial = {
    		type: jsPsychHtmlKeyboardResponse,
    		stimulus: `<h1>${condition.characters}</h1>`,
    		data: {
    			collect: true, // flag whether we want to collect to csv
        		characters: condition.characters,
        		blockId: block.title,
	        },
            choices: ['f', 'j'],
	        on_finish: function (data) {
	            if (data.response == 'f' && condition.isWord == true) {
	                data.correct = true;
	            } else if (data.response == 'j' && condition.isWord == false) {
	                data.correct = true;
	            } else {
	                data.correct = false;
	            }
	        }
	    };

	    timeline.push(conditionTrial);
	}
}

let resultsTrial = {
    type: jsPsychHtmlKeyboardResponse,
    choices: ['NO KEYS'],
    async: false,
    stimulus: `
        <h1>Please wait...</h1>
        <p>We are saving your answers.</p>
        `,
    on_start: function () {
        let prefix = 'ldt';
        let dataPipeExperimentId = 'FP1EmrkIikGE';
        let forceOSFSave = false;

        // Filter and retrieve results as CSV data
        let results = jsPsych.data
            .get()
            .filter({ collect: true })
            .ignore(['stimulus', 'trial_type', 'plugin_version', 'collect'])
            .csv();

        // Generate a participant ID based on the current timestamp
        let participantId = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '-');

        // Dynamically determine if the experiment is currently running locally or on production
        let isLocalHost = window.location.href.includes('localhost');

        let destination = '/save';
        if (!isLocalHost || forceOSFSave) {
            destination = 'https://pipe.jspsych.org/api/data/';
        }

        // Send the results to our saving end point
        fetch(destination, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            body: JSON.stringify({
                experimentID: dataPipeExperimentId,
                filename: prefix + '-' + participantId + '.csv',
                data: results,
            }),
        }).then(data => {
            console.log(data);
            jsPsych.finishTrial();
        })
    }
}
timeline.push(resultsTrial);

let debriefTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Thank you for participating!</h1> 
    <p>You can close this tab.</p>
    `,
    choices: ['NO KEYS'],
    on_start: function() {
    	let data = jsPsych.data
	    	.get()
	    	.filter({ collect: true}) 
	    	.ignore(['stimulus', 'trial_type', 'trial_index', 'plugin_version'])
	    	.csv();
    	console.log(data);
    }
};

timeline.push(debriefTrial);

jsPsych.run(timeline);