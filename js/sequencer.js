// The Sample Engine cPlayer() has to be imported TWICE
// Once here and also in the synth-controller module.
// Like Node.js, ES6 modules also have to imported into each module where it will be used
import cPlayer from './sample-engine.js';
const sequencer = (function(context) {
    const events = {};
    let myTimer,
        tick = 1,
        tempo = 60, // 60 bpm
        isRunning = false,
        tickValue = 60 / tempo,
        futureTickTime = context.currentTime;

    function sequencer() {
        if (futureTickTime < context.currentTime + 0.1) {
            emit('tick', tick);
            futureTickTime += tickValue;
            tick += 1;
        } // End main IF block
        myTimer = setTimeout(sequencer, 0);
    }

    function play() {
        if (!isRunning) {
            // play silent buffer to unlock the audio
            var buffer = context.createBuffer(1, 1, 22050);
            var node = context.createBufferSource();
            node.buffer = buffer;
            node.start(0);
            isRunning = true;
            futureTickTime = context.currentTime;
            sequencer();
            return;
        }
    }

    function stop() {
        tick = 1;
        isRunning = false;
        clearTimeout(myTimer);
    }

    function setTempo(newTempo) {
        tempo = newTempo
        tickValue = 60 / newTempo
    }

    function getTempo() {
        return tempo / 8;
    }
    // Event Emitter system
    function on(name, listener) {
        if (!events[name]) {
            events[name] = [];
        }
        events[name].push(listener);
    }

    function emit(name, param1, param2) {
        if (!events[name]) {
            return;
        }
        const fireCallbacks = (callback) => {
            callback(param1, param2);
        };
        events[name].forEach(fireCallbacks);
    }
    return {
        on,
        play,
        stop,
        setTempo,
        getTempo,
        isRunning
    }
})(cPlayer.context);

export default sequencer;