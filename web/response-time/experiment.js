let jsPsych = initJsPsych({
    show_progress_bar: true
});

let timeline = [];

let welcomeTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Welcome to the Response Time Task!</h1> 
    <p>In this experiment, you will see a blue or orange circle on the screen</p>
    <p>If you see a blue circle, press the F key.</p>
    <p>If you see a orange circle, press the J key.</p>
    <p>Press SPACE to begin.</p>
    `,
    choices: [' '],
};
timeline.push(welcomeTrial);


for (let condition of conditions) {
    // this loop means we run the conditionTrial and then the fixationTrial 
    // every time (including the last instance) so we end with a fixation
    // data collection is available within each trial
    // so to add data collection to this experiment, we 
    let conditionTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
            <img src='images/${condition}-circle.png'>
            `,
        data: {
            collect: true,
            colour: condition,  // added to record which colour name was shown
        },
        choices: ['f', 'j'],
        on_finish: function (data) {
            if (data.response == 'f' && condition == 'blue') {
                data.correct = true;
            } else if (data.response == 'j' && condition == 'orange') {
                data.correct = true;
            } else {
                data.correct = false;
            }
        }

    };
    timeline.push(conditionTrial);

    let fixationTrial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `+`,
        trial_duration: 500, // 500 milliseconds = .5 seconds
        choices: ['NO KEY']
    }
    timeline.push(fixationTrial);
}

let debriefTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <h1>Thank you for participating!</h1> 
    <p>You can close this tab.</p>
    `,
    choices: 'NO_KEYS',
    on_start: function () {
        let data = jsPsych.data
            .get()
            .filter({ collect: true })
            .ignore(['stimulus', 'trial_type', 'plugin_version', 'collect'])
            .csv();
        console.log(data);
    }
};

timeline.push(debriefTrial);

jsPsych.run(timeline);