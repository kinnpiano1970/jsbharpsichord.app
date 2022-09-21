// Main music display 
const musicDisplay = Vue.component('music-display', {
    props: ['currsong', 'selectcell', 'checkedbox', 'showcheckbox','showallvoices'],
    template: `<ul id="music-display" class="music-playlist" style="position: absolute;top:0px;left:0px; width: 100%; display: inline-block;">
<li v-for="(system,index) in currsong.systems" class="playlist-item bg--light-v3 shadow">

<div class="trebleA-clef">	
  <input v-for="(note,index2) in system[0]" v-on:click="selectcell($event,index,index2)" :value="note" type="text" data-measure="0" class="form-control form-control-sm measures trebleA-cell"  style="margin-right:5px;" readonly>
   </input>
</div>
<div class="bassA-clef">
 <input v-for="(note,index2) in system[1]" v-on:click="selectcell($event,index,index2)" :value="note" type="text" data-measure="1" class="form-control form-control-sm measures bassA-cell" style="margin-right:5px;" readonly>
  </input>
</div>
<transition name="slide-measure">
<div v-show="showallvoices" class="trebleB-clef">	
  <input v-for="(note,index2) in system[2]" v-on:click="selectcell($event,index,index2)"  :value="note" type="text" data-measure="2" class="form-control form-control-sm measures trebleB-cell"  style="margin-right:5px;" readonly>
   </input>
</div>
</transition>
<transition name="slide-measure">
<div v-show="showallvoices" class="bassB-clef">
 <input v-for="(note,index2) in system[3]" v-on:click="selectcell($event,index,index2)" :value="note" type="text" data-measure="3" class="form-control form-control-sm measures bassB-cell" style="margin-right:5px;" readonly>
  </input>
 </div>
</transition>

<span class="ck-badge bg--primary-v4 measure-number">{{index + 1 }}</span>
  <transition name="slideIn-fade">
      <div class="form-check" v-show="showcheckbox">
          <input v-on:change="checkedbox(index)" value="index" class="check-boxes form-check-input" type="checkbox" >
      </div>
  </transition>
</li>
</ul>`
});
// Save/Upload FORM to save songs to songs database
const uploadDownload = Vue.component('upload-download', {
    props: ['upload', 'currsong', 'clearform', 'state'],
    template: `<form v-on:submit.prevent="upload($event)" id="upload-form" class="upload-form shadow bg--light-v1" style="position: absolute;top:0px;left:0px; width: 100%; display: inline-block;">
<h3 class="ck-badge bg--primary saveform-headtext">Save / Update User Songs</h3>
<div class="">
<div class="">
  <label for="inputUsername">Sequenced By: {{currsong.createdBy}}</label>
  <input v-model="currsong.createdBy" type="text" name="username" class="form-control" id="inputUsername" placeholder="Username">
</div>
<div class="">
  <label for="inputComposer">Composer: {{currsong.composer}}</label>
  <input v-model="currsong.composer" type="text" name="composer" class="form-control" id="inputComposer" placeholder="Composer">
</div>
</div>
<div class="">
<label for="inputTitle">Song Title: {{currsong.title}}</label>
<input v-model="currsong.title" type="text" name="title" class="form-control" id="inputTitle" placeholder="Song Title">
<span v-on:click="clearform" class="ck-badge bg--warning" style="margin-top: 10px;cursor: pointer;">RESET</span>
</div>
<p></p>

<button v-if="currsong.id" v-bind:disabled="state.isdemoloaded" type="submit" class="ck-btn bg--warning">Update Song</button>
<button v-else type="submit" class="ck-btn bg--primary">Save Song</button>

<span v-show="state.isdemoloaded" class="no-update">
		Demo Songs Cannot Be Updated!
</span>
</form>`
});
// Shows downloaded USER/DEMO songs
const userSongs = Vue.component('user-songs', {
    props: ['selectsong', 'usersongs'],
    template: `<div class="user-songs-container">
		<table class="user-songs-table">
  			<thead>
    			<tr>
      				<th scope="col">Song ID</th>
      				<th scope="col">Title</th>
      				<th scope="col">Composer</th>
      				<th scope="col">Sequenced By:</th>
    			</tr>
  			</thead>
  	<tbody>
    <tr v-on:click="selectsong(usersongs,index)" v-for="(song,index) in usersongs" class="song-row">
      <td scope="row"><span class="badge badge-warning song-id">{{song.id}}</span></td>
      <td>{{song.title}}</td>
      <td>{{song.composer}}</td>
      <td>{{song.createdBy}}</td>
    </tr>
	
	</tbody>
   </table>
  </div>`
});
const appTutorial = Vue.component('app-tutorial', {

    props: [],
    template: `<div class="tutorial-section" style="position: absolute;top:0px;left:0px; width: 100%; display: inline-block;">
    <table class="user-songs-table">
        <thead>
            <tr>
                <th scope="col">Button</th>
                <th scope="col">Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td scope="row"><button class="ck-btn-pill bg--success-v1">
                    <i class="fas fa-play fa-lg"></i>
                </button></td>
                <td>Plays the Main Music Display</td>
            </tr>
            <tr>
                <td>
                    <button class="ck-btn-pill btn--pill-sm bg--secondary-v1">
                        <i class="far fa-play-circle fa-lg"></i>
                    </button>

                </td>
                <td>
                    Plays Notes Currently in the Measure Constructor
                </td>
            </tr>
            <tr>
                <td>
                    <button class="ck-btn-pill btn--pill-sm bg--secondary-v1">
                        <i class="fas fa-eraser fa-lg"></i>
                    </button>
                </td>
                <td>Clears the Measure Constructor</td>
            </tr>
            <tr>
                <td><button class="ck-btn-pill btn--pill-sm bg--warning">
                    <i class="fas fa-plus-square"></i>
                </button></td>
                <td>Add Measure from Measure Constructor to Main Music Display</td>
            </tr>
            <tr>
                <td><button class="ck-btn-pill btn--pill-sm bg--warning">
                    <i class="fas fa-minus-square"></i>
                </button></td>
                <td>Removes LAST Measure from the Main Music Display</td>
            </tr>
            <tr>
                <td><button class="ck-btn-pill btn--pill-sm bg--danger">
                    <i class="fas fa-trash-alt"></i>
                </button>
                </td>
                <td>Removes ALL Measures from the Main Music Display. Resets Song Data</td>
            </tr>
            <tr>
                <td><button class="ck-btn bg--dark">
                    <i class="fas fa-music fa-lg"></i>
                </button> </td>
                <td>Shows the Main Music Display</td>
            </tr>
            <tr>
                <td><button class="ck-btn bg--dark">
                    <i class="far fa-save fa-lg"></i> </button> </td>
                <td>Upload User Songs / Update User Songs</td>
            </tr>
            <tr>
                <td><button class="ck-btn bg--dark">
                    <i class="fas fa-download fa-lg"></i>
                </button>
                </td>
                <td>Downloads ALL User Created Songs</td>
            </tr>
            <tr>
                <td><button class="ck-btn bg--dark">
                    <i class="fas fa-info-circle fa-lg"></i> </button> </td>
                <td>Shows this Tutorial </td>
            </tr>
        </tbody>
    </table>
</div>
`

})


export { musicDisplay, uploadDownload, userSongs, appTutorial }