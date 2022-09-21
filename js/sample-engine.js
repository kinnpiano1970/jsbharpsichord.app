const cPlayer = (function () {
    const library = {
            // notes list with full path to samples
            notesList: {}
            , // raw notes list
            notesArray: [

            "C1", "Cs1_Db1", "D1", "Ds1_Eb1"
            , "E1", "F1", "Fs1_Gb1", "G1"
            , "Gs1_Ab1", "A1", "As1_Bb1", "B1"
            , "C2", "Cs2_Db2", "D2", "Ds2_Eb2"
            , "E2", "F2", "Fs2_Gb2", "G2"
            , "Gs2_Ab2", "A2", "As2_Bb2", "B2"
            , "C3", "Cs3_Db3", "D3", "Ds3_Eb3"
            , "E3", "F3", "Fs3_Gb3", "G3"
            , "Gs3_Ab3", "A3", "As3_Bb3", "B3"
            , "C4", "Cs4_Db4", "D4", "Ds4_Eb4"
            , "E4", "F4", "Fs4_Gb4", "G4"
            , "Gs4_Ab4", "A4", "As4_Bb4", "B4"
            , "C5", "Cs5_Db5", "D5", "Ds5_Eb5"
            , "E5"
            , "F5", "Fs5_Gb5", "G5"
            , "Gs5_Ab5", "A5", "As5_Bb5", "B5"
            , "C6", "Cs6_Db6", "D6", "Ds6_Eb6"
            , "E6", "F6", "rest"

        ]
            , // App methods
            // initialize application & load sounds
            init: function () {
                let dir = "audio/"
                    , ext = ".wav";
                this.notesArray.forEach((item, index) => {
                    this.notesList[item] = dir + item + ext;
                });
            }
        }
    // Create OBJECT literal that references the actual audio samples
    library.init();
    "use strict";
    const audioContext = audioContextCheck();
    const note = audioBatchLoader(library.notesList);

    function audioContextCheck() {
        if (typeof AudioContext !== "undefined") {
            return new AudioContext();
        }
        else if (typeof webkitAudioContext !== "undefined") {
            return new webkitAudioContext();
        }
        else if (typeof mozAudioContext !== "undefined") {
            return new mozAudioContext();
        }
        else {
            throw new Error('AudioContext not supported!!');
        }
    } // End audioContextCheck
    function audioBatchLoader(soundsToLoad) {
        for (let sound in soundsToLoad) {
            soundsToLoad[sound] = audioFileLoader(soundsToLoad[sound]);
        } // End FOR loop.
        return soundsToLoad;
    } // End audioBatchLoader()
    function audioFileLoader(soundToLoad) {
        let playSound;
        const soundObj = {
                soundToLoad: soundToLoad
                , play: function (time) {
                    playSound = audioContext.createBufferSource();
                    playSound.buffer = soundObj.soundToPlay;
                    playSound.connect(audioContext.destination);
                    playSound.loop = false;
                    playSound.start(audioContext.currentTime + time || audioContext.currentTime);
                    // playSound.onended=()=> { alert('dunn sun!')    }
                    // console.log(playSound)
                }
                , stop: function (time) {
                    playSound.stop(audioContext.currentTime + time || audioContext.currentTime);
                }
            } // end soundObj object
        fetch(soundObj.soundToLoad).then(function (response) {
            return response.arrayBuffer();
        }).then(function (buffer) {
            audioContext.decodeAudioData(buffer, function (decodedData) {
                soundObj.soundToPlay = decodedData;
            });
        });
        // console.log(soundObj);
        return soundObj;
    } // End audioFileLoader()
    function playNotes(tones) {
        if (Array.isArray(tones)) {
            tones.forEach((tone) => {
                note[tone].play();
                note[tone].stop(.8);
            });
        }
        else {
            Array.from(arguments).forEach((argument) => {
               //console.log(argument);
                note[argument].play();
                note[argument].stop(.8);
            })
        }
    } // End playNotes() function
    // console.log(note);
    return {
        note: note
        , library: library
        , context: audioContext
        , playNotes: playNotes
    }
})();

export default cPlayer;