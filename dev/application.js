/**
 * @author Camille Cutrone
 */
const app = new Vue({
    el: "#app",
    data: {
        isLoading: true,
        type: "months",
        currentMonth: 0,
        editedProject: {},
        editedVolunteer: {},
        months: [{}],
        volunteers: [{}]
    },
    methods: {
        getFullAddress(volunteer){
            return `${volunteer.address}, ${volunteer.city}, ${volunteer.locality}, ${volunteer.country}, ${volunteer.postal}`;
        },
        newVolunteer(){
            this.editedVolunteer = {
                firstName: "",
                lastName: "",
                email: "",
                address: "",
                city: "",
                locality: "",
                country: "",
                postal: ""
            }
        },
        deleteVolunteer(){
            removeVolunteer(this.editedVolunteer.userID, () => {
                this.volunteers = this.volunteers.filter(it => it.userID != this.editedVolunteer.userID)
                this.editedVolunteer = {};
            })
        },
        editVolunteer(userID){
            const _data = this.volunteers.filter(it => it.userID == userID)[0] || {}
            this.editedVolunteer = clone(_data);
        },
        saveVolunteer(){
            if(this.editedVolunteer.userID){
                const _newList = this.volunteers.filter(it => it.userID != this.editedVolunteer.userID);
                _newList.push(clone(this.editedVolunteer));
                sendVolunteer(this.editedVolunteer, () => {
                    this.editedVolunteer = {};
                    this.volunteers = _newList.sort(sortProjects);
                });
            } else {
                sendVolunteer(this.editedVolunteer, (project) => {
                    const _newList = this.volunteers;
                    this.editedVolunteer.userID = project.userID;

                    _newList.push(this.editedVolunteer);
                    
                    this.editedVolunteer = {};
                    this.volunteers = _newList.sort(sortProjects);
                });
            }
        },
        newProject(){
            this.editedProject = {
                country: "",
                manager: "",
                type: "",
                cost: 0,
                endsOnCurrentMonth: false
            }
        },
        deleteProject(){
            removeProject(this.editedProject.projectID, () => {
                this.months.forEach(it => {
                    it.projects = it.projects.filter(it => it.projectID != this.editedProject.projectID);
                });
                this.editedProject = {};
            })
        },
        editProject(projectID){
            const _data = this.months[this.currentMonth].projects.filter(it => it.projectID == projectID)[0] || {}
            this.editedProject = clone(_data);
        },
        saveProject() {
            this.editedProject.currentMonth = this.currentMonth;
            if(this.editedProject.projectID){
                this.months.forEach((it, index) => {
                    it.projects = it.projects.filter(it => it.projectID != this.editedProject.projectID)
                    if (!(this.editedProject.endsOnCurrentMonth && index > this.currentMonth))
                        it.projects.push(clone(this.editedProject))
                    it.projects = it.projects.sort(sortProjects);
                });
                sendProject(this.editedProject, () => {
                    this.editedProject = {};
                });
            } else {
                sendProject(this.editedProject, (project) => {
                    this.editedProject.projectID = project.projectID;

                    this.months = this.months.map((it, index) => {
                        if(index >= this.currentMonth){
                            it.projects.push(clone(this.editedProject))
                            it.projects = it.projects.sort(sortProjects);
                        }
                        return it;
                    });
                    this.editedProject = {};
                });
            }
        }
    },
    computed: {
        getRoofOfChart(){
            return (this.months[this.currentMonth]
                        .projects || [])
                        .map((it) => it.cost)
                        .sort((a, b) => b - a)[0];
        },
        getChartY(){
            return [0, 0, 0, 0, 0]
                .fill(
                    this.getRoofOfChart, 
                    0, 4
                )
                .map((it, index) => ((it / (index + 1)) / 1000).toFixed(2) + "k");
        }
    }
});

/**
 * Sends POST request to delete volunteer from the database
 * @param { String } userID
 * @param { Function } callback 
 * @author Camille Cutrone
 */
const removeVolunteer = (userID, callback) => 
    post(`/api/data/remove/volunteer`, { userID: userID }).then(callback);

/**
 * Sends POST request to delete project from the database
 * @param { String } projectID
 * @param { Function } callback 
 * @author Camille Cutrone
 */
const removeProject = (projectID, callback) => 
    post(`/api/data/remove/project`, { projectID: projectID }).then(callback);

/**
 * Sends the updated project information to the server
 * @param { JSON } project 
 * @param { Function } callback 
 * @author Camille Cutrone
 */
const sendProject = (project, callback) => 
    post(`/api/data/edit/project`, { project: project }).then(callback);

/**
 * Sends the updated volunteer information to the server
 * @param { JSON } volunteer 
 * @param { Function } callback 
 * @author Camille Cutrone
 */
const sendVolunteer = (volunteer, callback) => 
    post(`/api/data/edit/volunteer`, { volunteer: volunteer }).then(callback);

/**
 * Sorts the projects based on country name and project type
 * @param { JSON } a 
 * @param { JSON } b 
 * @author Camille Cutrone
 */
const sortProjects = (a, b) => {
    if(a.country == b.country) return a.type > b.type ? 1 : -1;
    else return a.country > b.country ? 1 : -1;
};

/**
 * Converts a number in string format to US currency
 * @param { String } string 
 * @author Camille Cutrone
 */
const toCurrency = (string) => 
    parseFloat(string)
        .toLocaleString(undefined, { 
            style: "currency", 
            currency: "USD" 
        });

/**
 * Updates the type variable and loads the data
 * @param { String } type Either 'months' or 'volunteers'
 * @author Camille Cutrone
 */
const changeType = (type) => {
    Vue.set(app, "editedProject", {});
    Vue.set(app, "type", type);
    loadData(type);
}

/**
 * Sets the current month
 * @param { Number } month 
 * @author Camille Cutrone
 */
const setMonth = (month) => {
    Vue.set(app, "editedProject", {});
    Vue.set(app, "currentMonth", month);
}

/**
 * Hides the application while a GET request is made to 
 * the server to retrieve the data
 * @param { String } type Either 'months' or 'volunteers'
 * @author Camille Cutrone
 */
const loadData = (type) => {
    Vue.set(app, "isLoading", true);
    get(`/api/data/${type}`).then((response)=> {
        if(type == 'months')
            response = response.map(it => {
                const _projects = (it.projects || []).sort(sortProjects);
                it.projects = _projects;
                return it;
            });

        Vue.set(app, type, response)
        Vue.set(app, "isLoading", false);
    });
}

/**
 * Executes a POST request and responds as a Promise
 * @param { String } url 
 * @param { JSON } data 
 * @author Camille Cutrone
 */
const post = (url, data) => new Promise((resolve, reject) => {
    const _req = new XMLHttpRequest();
    _req.onload = () => {
        const _response = JSON.parse(_req.response);
        if(_response.error) reject(_response);
        else resolve(_response);
    };
    _req.open("POST", url);
    _req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    _req.send(JSON.stringify(data));
});

/**
 * Executes a GET request and responds as a Promise
 * @param { String } url 
 * @author Camille Cutrone
 */
const get = (url) => new Promise((resolve, reject) => {
    const _req = new XMLHttpRequest();
    _req.onload = () => {
        const _response = JSON.parse(_req.response);
        if(_response.error) reject(_response);
        else resolve(_response);
    };
    _req.open("GET", url);
    _req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    _req.send();
});

/**
 * Clones the JSON object as a seperate object
 * @param { JSON } obj 
 * @author Camille Cutrone
 */
const clone = (obj) => JSON.parse(JSON.stringify(obj));

window.addEventListener("load", ()=>{
    loadData("months");
})