// The Sample Engine cPlayer() has to be imported TWICE
// Once here and also in the sequncer module.
// Like Node.js, ES6 modules also have to imported into each module where it will be used
import cPlayer from './js/sample-engine.js';
import sequencer from './js/sequencer.js';
import {
    toneMap,
    keyMap
} from './js/keymaps.js';
import {
    musicDisplay,
    uploadDownload,
    appTutorial,
    userSongs,
} from './vue-components.js';
import demoSong from './demo.js';
(function(win, doc) {
    new Vue({
        el: "#app",
        //component: ["music-display", "upload-download", "user-songs"],
        component: [musicDisplay, uploadDownload, userSongs, appTutorial],
        data: {
            viewMessage: true,
            count: 0,
            testing: '',
            newtempo: 0,
            metronome: 0,
            title: "J.S.B Harpsichord Composer",
            composer: 'Created By Charles D. Kinney',
            columns: "repeat(16,auto)",
            v1: "rest",
            v2: "rest",
            bpm: 10,
            npm: 6,
            note: "C1",
            beat: 0,
            voice1: [],
            voice2: [],
            voice3: [],
            voice4: [],
            measures: 0,
            currCell: 0,
            currClef: 0,
            prevBeat: 0,
            eeMode: 'flats', // enharmonic equivalent mode
            tACells: null,
            fACells: null,
            tBCells: null,
            fBCells: null,
            lastMeasure: 0,
            currMeasure: 0,
            totalMeasures: 0,
            measureCount: 1,
            measureCounter: 0,
            songLength: 0,
            currElem: null,
            activePage: "Create & Play Music",
            modalMessage: '',
            showModal: 'none',
            showMusic: true,
            showcheckbox: false,
            showupload: false,
            showMessage: false,
            showTutorial: false,
            showPlayFrom: false,
            showPianoKeys: true,
            showUserSongs: false,
            showallvoices: false,
            showTempoControl: false,
            selectedMeasures: [],
            isActive: false,
            message: 0,
            sysMessage: "",
            usersongs: [],
            currsong: {
                id: null,
                npm: 6,
                title: "",
                tempo: 120,
                composer: "",
                createdBy: "",
                systems: [],
            },
            pages: ["showMusic", "showupload", "showUserSongs", "showTutorial"],
            state: {
                isPreview: false,
                isPlaying: false,
                isdemoloaded: false,
                isUserLoaded: false,
            },
            urls: {
                demoSongs: "https://cdkinney.com/jsb_api/demos",
                userSongs: "https://cdkinney.com/jsb_api/users",
                saveSongs: "https://cdkinney.com/jsb_api/save",
            },
            // Indicate strong/weak beat above note cells
            beatNumStyles: {
                4: ['#FF0075', '#FFA900', '#FF0075', '#FFA900'],
                6: ['#FF0075', '#FFA900', '#FF0075', '#FFA900', '#FF0075', '#FFA900'],
                8: ['#FF0075', '#FFA900', '#FF0075', '#FFA900', '#FF0075', '#FFA900', '#FF0075', '#FFA900'],
                9: ['#FF0075', '#FFA900', '#FFA900', '#FF0075', '#FFA900', '#FFA900', '#FF0075', '#FFA900', '#FFA900'],
                12: ['#FF0075', '#FFA900', '#F48FB1', '#FFA900', '#FF0075', '#FFA900',
                    '#F48FB1', '#FFA900', '#FF0075', '#FFA900', '#F48FB1', '#FFA900'
                ],
                16: ['#FF0075', '#FFA900', '#F48FB1', '#FFA900', '#FF0075', '#FFA900',
                    '#F48FB1', '#FFA900', '#FF0075', '#FFA900', '#F48FB1', '#FFA900',
                    '#FF0075', '#FFA900', '#F48FB1' , '#FFA900',
                ],
            },
        },
        methods: {
            testMe() {



            },
            keyPress(event) {
                let respond = getKeyValue(event);
                if (!respond) {
                    return;
                }

                if (this.currElem === null) {
                    this.showSysMessage("Please select a cell FIRST!");
                    return;
                }
                /* Checks if note was added to the MAIN music display
					If so then update currsong.systems array with new note */
                if (this.currElem.classList.contains("measures")) {
                    this.updateSystems(respond);
                }
                cPlayer.note[toneMap[respond]].play();
                cPlayer.note[toneMap[respond]].stop(0.8);
                this.note = respond;
                this.currElem.value = this.getEEMode(respond);
                this.isActive = false;
                this.currElem.style["background-color"] = "white";
                liteUpKey(respond);
            },
            // Allows user to add notes to cells of the main display
            // Update currsong.systems array with new note
            updateSystems(respond) {
                let mn = this.currMeasure;
                let clef = this.currClef;
                let cell = this.currCell;
                this.currsong.systems[mn][clef].splice(cell, 1, this.getEEMode(respond));
            },
            // Gets current location of a clicked cell
            getCurrPos(event, index, index2) {
                this.currCell = Number(index2);
                this.currMeasure = Number(index);
                this.currClef = Number(
                    event.currentTarget.getAttribute("data-measure")
                );
            }, // Handle adding/removing cell hightlights
            selectcell(event, index, index2) {
                
                if (event.target.classList.contains("note-container")) {
                    return;
                }
            
                /*
				if (!event.target.classList.contains("measures")) {
					return;	
				}
				*/
                console.log(event.target.classList);

                this.getCurrPos(event, index, index2);
                if (this.currElem === null) {
                    this.currElem = event.target;
                    this.currElem.style["background-color"] = "bisque";
                    this.isActive = true;
                    return;
                }
                if (event.target !== this.currElem) {
                    this.currElem.style["background-color"] = "white";
                    this.currElem = event.target;
                    this.currElem.style["background-color"] = "bisque";
                    this.isActive = true;
                    return;
                }
                if (this.isActive === false) {
                    this.isActive = true;
                    this.currElem.style["background-color"] = "bisque";
                    return;
                }
                this.isActive = false;
                this.currElem.style["background-color"] = "white";
            },
            /* Converts raw note input into a more 
            standard music notation. "ee" (enharmonic equivalent) 
            mode is either natural, flats or sharps */
            getEEMode(respond) {
                // Check if is a black key
                if (respond.includes("b")) {
                    if (this.eeMode === 'flats') {
                        return respond.substr(4, 3);
                    }
                    if (this.eeMode === 'sharps') {
                        return respond.substr(0, 3)
                            .replace("s", "#");
                    }
                }
                return respond;
            },
            add() {

                let measureLen = this.currsong.systems.length;
                this.currsong.systems.push(parseElem());
                this.setTotalMeasures();
                resetConstructor();
                this.showPage("music");
            },
            remove() {
                this.reset();
                this.currsong.systems.pop();
                this.setTotalMeasures();
                if (this.currsong.systems.length < 1) {
                    this.currElem = null;
                    this.clearSongData();
                }
            },
            removeAll() {
                this.title = "J.S.B Harpsichord Composer";
                this.composer = "Created By Charles D. Kinney";
                this.currElem = null;
                this.clearSongData();
                this.clearMusicData();
                this.setTotalMeasures();
            },
            clear() {
                resetConstructor();
            },
            setTotalMeasures() {
                let totalMeasures = this.currsong.systems.length;
                this.totalMeasures = totalMeasures;
            },
            openPlayFrom() {
                if (this.showPlayFrom) {
                    this.showPlayFrom = false;
                    return;
                }
                this.stop();
                this.showPlayFrom = true;
            },
            selectMeasure(index) {
                let npm = this.currsong.systems[0][0].length;
                this.beat = npm * index;
                this.measureCount = index + 1;
                this.showPlayFrom = false;
                this.play();
            },
            // This is actually more of a pre-play
            // Formats notes in the notes array so they can be played
            // Then starts the sequencer.
            play() {
                if (this.state.isPlaying) {
                    this.stop();
                    return;
                }
                if (this.currsong.systems < 1) {
                    this.showSysMessage("Please add measures first!");
                    return;
                }
                this.measures = this.currsong.systems.length;
                /* Flatten notes array for playback with a little help from my clone of the LODASH _.flatten() method */
                // Set notes for the VOICE 1
                this.voice1 = flatten(this.currsong.systems, 0);
                // Set notes for the VOICE 2
                this.voice2 = flatten(this.currsong.systems, 1);
                // Set notes for the VOICE 3
                this.voice3 = flatten(this.currsong.systems, 2);
                // Set notes for the VOICE 4
                this.voice4 = flatten(this.currsong.systems, 3);
                this.songLength = this.voice1.length;
                // Get reference to note cells at playback start
                // This is used highlight cells on playback
                this.tACells = getMusicCells().tACells;
                this.fACells = getMusicCells().fACells;
                this.tBCells = getMusicCells().tBCells;
                this.fBCells = getMusicCells().fBCells;
                sequencer.play();
                this.state.isPlaying = true;
            },
            // This function actually plays the notes.
            playDriver() {
                let v1 = this.voice1[this.beat];
                let v2 = this.voice2[this.beat];
                let v3 = this.voice3[this.beat];
                let v4 = this.voice4[this.beat];

                cPlayer.playNotes(toneMap[v1], toneMap[v2], toneMap[v3], toneMap[v4])

                //Hightlight keys during playback
                liteUpKey(v1);
                liteUpKey(v2);
                liteUpKey(v3);
                liteUpKey(v4);
                if (!this.state.isPreview) {
                    this.playHighlight();
                }
                this.beat++;
                this.prevBeat = this.beat - 1;
                // Calculate current measure during playback
                this.measureCounter++;
                if (this.beat >= this.songLength) {
                    this.reset();
                }
                if (this.measureCounter >= this.npm) {
                    this.measureCount++;
                    this.measureCounter = 0;
                }
            },
            playHighlight() {
                this.tACells[this.prevBeat].classList.remove("selected");
                this.fACells[this.prevBeat].classList.remove("selected");

                this.tBCells[this.prevBeat].classList.remove("selected");
                this.fBCells[this.prevBeat].classList.remove("selected");

                this.tACells[this.beat].classList.toggle("selected");
                this.fACells[this.beat].classList.toggle("selected");

                this.tBCells[this.beat].classList.toggle("selected");
                this.fBCells[this.beat].classList.toggle("selected");

                this.scrollIntoView(this.beat);
            },
            scrollIntoView(elemNumber) {
                this.tACells[elemNumber].scrollIntoView({
                    behavior: "auto",
                    block: "center",
                });
            },
            stop() {
                this.reset();
                this.state.isPreview = false;
                this.state.isPlaying = false;
                sequencer.stop();
            },
            rewind() {},
            preview() {
                if (this.state.isPreview) {
                    this.stop();
                    return;
                }
                this.voice1 = parseElem()[0];
                this.voice2 = parseElem()[1];
                this.voice3 = parseElem()[2];
                this.voice4 = parseElem()[3];
                this.songLength = this.voice1.length;
                this.state.isPreview = true;
                this.reset();
                sequencer.play();
            },
            /* This method runs when a box is checked AND when
                a box is unchecked. When a box is unchecked it 
                has to be REMOVED from the selectedMeasures array */
            checkedbox(index) {
                // Is the checkbox already selected? 
                if (this.selectedMeasures.includes(index)) {
                    // Find position of index the checkmark to remove
                    let position = this.selectedMeasures.indexOf(index);
                    // Removes previously selected index from array
                    this.selectedMeasures.splice(position, 1);
                    return;
                }
                this.selectedMeasures.push(index);
            },
            copyPasteMeasures() {
                let tempArr = [];
                if (!this.selectedMeasures.length > 0) {
                    this.showSysMessage("Can't copy. Nothing is selected!!");
                    return;
                }
                tempArr = this.selectedMeasures
                    .map((item) => {
                        let copy = this.currsong.systems[item];
                        /* As Javascript saves Arrays BY REFERENCE,
						need to copy original ARRAY without 
						keeping a reference to original array
						The little trick below does this. */
                        return JSON.parse(JSON.stringify(copy));
                    })
                    .forEach((item) => {
                        this.currsong.systems.push(item);
                    });
                clearChecked();
                this.selectedMeasures = [];
            },
            reset() {
                this.beat = 0;
                this.prevBeat = 0;
                this.measureCount = 1;
                this.measureCounter = 0;
            },
            clearSongData() {
                this.currsong.id = null;
                this.currsong.title = "";
                this.currsong.tempo = 120;
                this.currsong.composer = "";
                this.currsong.createdBy = "";
                this.state.isdemoloaded = false;
            },
            clearMusicData() {
                this.currsong.systems = [];
            },
            resetALL() {
                this.reset();
                this.clearSongData();
                this.clearMusicData();
            },
            showSysMessage(message) {
                this.sysMessage = message;
                this.showMessage = true;
                setTimeout(() => {
                    this.showMessage = false;
                    //this.sysMessage = "";
                }, 3000);
            },
            upload(event) {
                if (!this.validate()) {
                    return;
                }
                this.currsong.npm = this.npm;
                const url = this.urls.saveSongs;
                this.showModal = 'block';
                this.modalMessage = 'Uploading Your AMAZING Song!'
                fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(this.currsong),
                    })
                    .then((response) => response.json())
                    .then((data) => {
                        this.showModal = 'none';
                        this.modalMessage = '';
                        this.showSysMessage(data.message);
						console.log(data.id)
						if (!data.id) {
							return;
						}
						this.currsong.id = data.id;
                      //let id = JSON.parse(data).insertId;
						//console.log(id)
                        //this.showSysMessage(`Song Saved!! Insert ID: ${id}`);
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            },
            checkIfDownloaded(url, type) {
                let len = 0;
                //let len = this.usersongs.length;
                if (len < 1) {
                    this.fetchSongs(url, type);
                    return;
                }
                this.showUserSongs = false;
                this.showPage("user-demo");
                console.log('Already downloaded songs!');
            },
            fetchSongs(url, type) {
                this.showModal = 'block';
                this.modalMessage = 'Downloading User Songs....';
                fetch(url)
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        let songs = JSON.parse(data);
                        this.showModal = 'none';
                        this.modalMessage = '';
                        this.clearBeforeLoading();
                        this.showSysMessage(`${songs.length} Songs Downloaded!`);
                        if (type === "user") {
                            this.parseUserSongs(songs);
                            return;
                        }
                        this.parseDemoSongs(songs);
                    })
                    .catch((error) => {
                        this.showModal = 'none';
                        this.showSysMessage(error);
                        console.error("Error:", error);
                    });
            },
            // Clears song if loaded before showing user songs
            clearBeforeLoading() {
                this.stop();
                this.clearSongData();
                this.clearMusicData();
            },
            /* Format data from database so it 
			can be displayed in the interface */
            parseUserSongs(songs) {
                this.usersongs = [];
                songs.forEach((song) => {
                    let obj = {};
                    let songData = JSON.parse(song.song_data);
                    for (let prop in songData) {
                        obj[prop] = songData[prop];
                    }
                    obj.id = song.id;
                    this.usersongs.push(obj);
                });
                this.clearSongData();
                this.clearMusicData();
                this.showPage("user-demo");

            },
            // Convert demo songs from old format
            // to be be usable in this version.
            parseDemoSongs(songs) {
                this.usersongs = [];
                songs.forEach((song) => {
                    let obj = {};
                    let tempArr = [];
                    let songData = JSON.parse(song.song_data);
                    obj.systems = [];
                    // Build new song object from old songs_data object
                    obj.id = song.id;
                    obj.title = songData.title;
                    obj.tempo = songData.tempo;
                    obj.composer = songData.composer;
                    obj.createdBy = songData.username;
                    tempArr.push(songData.tAClef, songData.fAClef);
                    obj.systems.push(tempArr);
                    this.usersongs.push(obj);
                    this.state.isdemoloaded = true;
                });
                this.showPage("user-demo");
            },
            selectsong(songs, index) {
                this.currsong = songs[index];
                this.title = this.currsong.title;
                this.composer = this.currsong.composer;
                this.npm = this.currsong.npm;
                this.setTotalMeasures();
                this.showPage("music");
            },
            // Make sure song is ready to upload
            validate() {
                let song = this.currsong;
                if (
                    song.title.length < 1 ||
                    song.composer.length < 1 ||
                    song.createdBy.length < 1
                ) {
                    this.showSysMessage("All Fields Must Contain Data!");
                    return false;
                }
                if (song.systems.length < 1) {
                    this.showSysMessage("There is no NOTE data!");
                    return false;
                }
                return true;
            },
            clearform() {
                let song = this.currsong;
                song.title = "";
                song.composer = "";
                song.createdBy = "";
            },
            // Handle switching between components
            showPage(selectedPage) {
                /* Hide whatever page is currently 
				visible by looping thru ALL pages */
                this.pages.forEach((page) => {
                    this[page] = false;
                });
                switch (selectedPage) {
                    case "music":
                        this.showMusic = true;
                        this.activePage = "Create & Play Music";
                        break;
                    case "upload":
                        this.stop();
                        this.showupload = true;
                        this.activePage = "Save Songs";
                        break;
                    case "user-demo":
                        this.showUserSongs = true;
                        this.activePage = "Play User Songs";
                        break;
                    case "tutorial":
                        this.showTutorial = true;
                        this.activePage = "Application Tutorial";
                        break;
                    default:
                        break;
                }
            },
            mouseHover(event) {
                let note = event.target.id;
                if (!note.length > 0) {
                    this.note = "*";
                    return;
                }
                this.note = note;
            }
        },
        computed: {},
        filters: {
            showBeat(beat) {
                return beat + 1;
            },
            showAndSetTempo(tempo) {
                sequencer.setTempo(tempo * 2)
                return tempo;
            },

        },
        watch: {
            npm(npm) {
                this.currsong.npm = npm;
            }
        },
        created() {
            // Seqencer Module driver
            sequencer.on('tick', (tick) => {
                this.playDriver();
            })
        },
        mounted() {
            this.currsong = demoSong;
                this.title = demoSong.title;
                this.composer = demoSong.composer;
                this.npm = demoSong.npm;
                this.setTotalMeasures();
                this.showPage("music");
        },
    });
    // Helper functions
    const pKeys = document.querySelectorAll(".key");
    // Hightlight piano keys when key is pressed
    function liteUpKey(note) {
        let keyNum = keyMap[note];
        let fillColor = pKeys[keyNum].getAttribute("fill");
        pKeys[keyNum].setAttribute("fill", "#e06377");
        setTimeout(() => {
            pKeys[keyNum].setAttribute("fill", fillColor);
        }, 150);
    } // END liteUpKey();
    /* Flatten the multi-dimensional 
    currsong.systems array to a single level*/
    function flatten(systems, num) {
        let flattened = [];
        for (const system of systems) {
            for (const note of system[num]) {
                flattened.push(note)
            }
        };
        return flattened;
    };

    function getKeyValue(event) {
        if (event.target.classList.contains("key-label")) {
            return event.target.getAttribute("data-key");
        }
        if (event.target.classList.contains("key")) {
            return event.target.id;
        }
    }
    // Get notes from the MEASURE CONSTRUCTOR input elements
    function parseElem() {
        let tempArr = [];
        let trebleANotes = Array.from(getElems().tAClef).map((elem) => {
            return elem.value;
        });
        let bassANotes = Array.from(getElems().fAClef).map((elem) => {
            return elem.value;
        });
        let trebleBNotes = Array.from(getElems().tBClef).map((elem) => {
            return elem.value;
        });
        let bassBNotes = Array.from(getElems().fBClef).map((elem) => {
            return elem.value;
        });
        tempArr.push(trebleANotes, bassANotes, trebleBNotes, bassBNotes);
        return tempArr;
    }
    // Reset Measure Constructor (Clears textarea values)
    function resetConstructor() {
        let elems = document.querySelectorAll(".notes");
        elems.forEach((elem) => {
            elem.value = "rest";
        });
    }
    // Get Measure Constructor INPUT ELEMENTS
    function getElems() {
        let tAClef = document.querySelectorAll(".trebleA-notes");
        let fAClef = document.querySelectorAll(".bassA-notes");
        let tBClef = document.querySelectorAll(".trebleB-notes");
        let fBClef = document.querySelectorAll(".bassB-notes");
        return {
            tAClef,
            fAClef,
            tBClef,
            fBClef
        };
    }
    // Get reference to Music Display NOTE CELL elements.
    function getMusicCells() {
        let tACells = document.querySelectorAll(".trebleA-cell");
        let fACells = document.querySelectorAll(".bassA-cell");
        let tBCells = document.querySelectorAll(".trebleB-cell");
        let fBCells = document.querySelectorAll(".bassB-cell");
        return {
            tACells,
            fACells,
            tBCells,
            fBCells
        };
    }
    // Reset checkboxes to unchecked
    function clearChecked() {
        let checkBoxes = document.querySelectorAll(".check-boxes");
        checkBoxes.forEach((box, index) => {
            if (box.checked) box.checked = false;
        });
    }
})(window, document);