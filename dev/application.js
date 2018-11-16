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
                name: "",
                address: "",
                city: "",
                locality: "",
                country: "",
                postal: ""
            }
        },
        deleteVolunteer(){
            removeVolunteer(this.editedVolunteer.volunteerID, () => {
                this.volunteers = this.volunteers.filter(it => it.volunteerID != this.editedVolunteer.volunteerID)
            })
        },
        editVolunteer(volunteerID){
            this.editedVolunteer = JSON.parse(
                JSON.stringify(
                    this.volunteers.filter(it => it.volunteerID == volunteerID)[0] || {}
                )
            );
        },
        saveVolunteer(){
            if(this.editedVolunteer.volunteerID){
                const _newList = this.volunteers.filter(it => it.volunteerID != this.editedVolunteer.volunteerID);
                _newList.push(JSON.parse(JSON.stringify(this.editedVolunteer)));
                sendVolunteer(this.editedVolunteer, () => {
                    this.editedVolunteer = {};
                    this.months[this.currentMonth].projects = _newList.sort(sortProjects);
                });
            } else {
                sendVolunteer(this.editedVolunteer, (project) => {
                    const _newList = this.volunteers;
                    this.editedVolunteer.volunteerID = project.volunteerID;

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
                this.months[this.currentMonth].projects = 
                this.months[this.currentMonth]
                    .projects
                    .filter(it => it.projectID != this.editedProject.projectID);
                this.editedProject = {};
            })
        },
        editProject(projectID){
            this.editedProject = JSON.parse(
                JSON.stringify(
                    this.months[this.currentMonth]
                        .projects
                        .filter(it => it.projectID == projectID)[0] || {}
                )
            );
        },
        saveProject() {
            if(this.editedProject.projectID){
                const _newList =
                    this.months[this.currentMonth]
                        .projects
                        .filter(it => it.projectID != this.editedProject.projectID);
                _newList.push(JSON.parse(JSON.stringify(this.editedProject)));
                sendProject(this.editedProject, () => {
                    this.editedProject = {};
                    this.months[this.currentMonth].projects = _newList.sort(sortProjects);
                });
            } else {
                sendProject(this.editedProject, (project) => {
                    const _newList = this.months[this.currentMonth].projects
                    this.editedProject.projectID = project.projectID;

                    _newList.push(this.editedProject);
                    
                    this.editedProject = {};
                    this.months[this.currentMonth].projects = _newList.sort(sortProjects);
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

const removeVolunteer = (volunteerID, callback) => 
    post(`/api/data/remove/volunteer`, volunteerID).then(callback);

const removeProject = (projectID, callback) => 
    post(`/api/data/remove/project`, { projectID }).then(callback);

const sendProject = (project, callback) => 
    post(`/api/data/edit/project`, project).then(callback);

const sendVolunteer = (volunteer, callback) => 
    post(`/api/data/edit/volunteer`, volunteer).then(callback);

const sortProjects = (a, b) => {
    if(a.country == b.country) return a.type > b.type ? 1 : -1;
    else return a.country > b.country ? 1 : -1;
};

const toCurrency = (string) => 
    parseFloat(string)
        .toLocaleString(undefined, { 
            style: "currency", 
            currency: "USD" 
        });

const changeType = (type) => {
    Vue.set(app, "editedProject", {});
    Vue.set(app, "type", type);
    loadData(type);
}

const setMonth = (month) => {
    Vue.set(app, "editedProject", {});
    Vue.set(app, "currentMonth", month);
}

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

window.addEventListener("load", ()=>{
    loadData("months");
})