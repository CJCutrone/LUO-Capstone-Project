import database from "./database";
import uuid from "uuid/v4";

/**
 * Retrieves the list of projects from the database, but divides the project 
 * breakdowns into months, so that each project can be viewed in light of the 
 * requested month
 * @param { Request } _ unused, but because of the way JS works, it must be there
 * @param { Response } resp 
 * @author Camille Cutrone
 */
const monthsData = async (_, resp) => {
    const _month = getBlankDate();
    _month.setMonth(0);

    const _months = [
        { name: "Jan", projects: [] },
        { name: "Feb", projects: [] },
        { name: "Mar", projects: [] },
        { name: "Apr", projects: [] },
        { name: "May", projects: [] },
        { name: "June", projects: [] },
        { name: "July", projects: [] },
        { name: "Aug", projects: [] },
        { name: "Sep", projects: [] },
        { name: "Oct", projects: [] },
        { name: "Nov", projects: [] },
        { name: "Dec", projects: [] },
    ];

    await database
            .query("SELECT * FROM projects WHERE startDate >= ?;", [ _month ])
            .then(results => {
                results.forEach(result => {
                    const _start = new Date(result.startDate).getMonth()
                    const _end = (result.endDate ? new Date(result.endDate).getMonth() : 10) + 1
                    _months.slice(_start, _end).forEach((it, index) => {
                        it.projects.push({
                            projectID: result.projectID,
                            country: result.country,
                            type: result.type,
                            cost: result.cost,
                            manager: result.overseer,
                            endsOnCurrentMonth: _end == (index + _start) + 1
                        })
                    })
                });
            });

    await database
            .query("SELECT * from payments WHERE date >= ?;", [ _month ])
            .then(results => {
                results.forEach(result => {
                    const _month = new Date(result.date).getMonth();
                    _months[_month]
                        .projects
                        .filter(it => it.projectID == result.projectID)
                        .forEach(it => it.cost = result.cost);
                });
            })
    resp.json(_months)
};
/**
 * Retrieves the list of volunteers from the database
 * @param { Request } _ unused, but because of the way JS works, it must be there
 * @param { Response } resp 
 * @author Camille Cutrone
 */
const volunteerData = async (_, resp) => {
    const _volunteers = [];
    await database
            .query("SELECT * FROM volunteer_information LEFT JOIN users ON users.userID=volunteer_information.userID;")
            .then(results => {
                results.forEach(it=>{
                    _volunteers.push({
                        userID: it.userID,
                        firstName: it.firstName,
                        lastName: it.lastName,
                        email: it.email,
                        address: it.address,
                        city: it.city,
                        locality: it.locality,
                        country: it.country,
                        postal: it.postal
                    })
                })
            });
    resp.json(_volunteers);
}
/**
 * Takes the information provided and either updates an already existing 
 * project, or inserts a new project into the database depending on
 * if there is a projectID in the data. If a project already exists, the 
 * cost is not updated; rather it is inserted as a payment entry to track
 * for payments that deviate from the original. 
 * @param { Request } req 
 * @param { Response } resp  
 * @author Camille Cutrone
 */
const updateProject = async (req, resp) => {
    const _project = req.body.project;
    const _month = getBlankDate();
    _month.setMonth(_project.currentMonth);
    if(!_project.projectID){
        _project.projectID = uuid();
        await database
            .query("INSERT INTO projects (projectID, overseer, country, type, cost, startDate) VALUES (?, ?, ?, ?, ?, ?);", 
                    [_project.projectID, _project.manager, _project.country, _project.type, _project.cost, _month])
            .then(_ => resp.json({ projectID: _project.projectID }));
    } else {
        const _paymentID = await database
                .query("SELECT paymentID FROM payments WHERE projectID=? AND date=?;", [_project.projectID, _month])
                .then(result => {
                    if(result.length > 0) return result[0].paymentID;
                    else return uuid();
                });
        await database
            .query("UPDATE projects SET overseer=?, country=?, type=? WHERE projectID=?;\
                    REPLACE INTO payments (paymentID, projectID, cost, date) VALUES (?, ?, ?, ?);", 
                    [_project.manager, _project.country, _project.type, _project.projectID,
                     _paymentID, _project.projectID, _project.cost, _month])
            .then(_ => resp.json({ projectID: _project.projectID }));
    }
    await database.query("UPDATE projects SET endDate=? WHERE projectID=?;", [_project.endsOnCurrentMonth ? _month: null, _project.projectID]);
}

/**
 * Takes the information provided and either updates an already existing 
 * volunteer, or inserts a new volunteer into the database depending on
 * if there is a volunteerID in the data
 * @param { Request } req 
 * @param { Response } resp 
 * @author Camille Cutrone
 */
const updateVolunteer = async (req, resp) => {
    const _volunteer = req.body.volunteer;
    const _month = new Date();

    if(!_volunteer.userID){
        _volunteer.userID = uuid();
        await database
            .query("INSERT INTO users (userID, firstName, lastName, email) VALUES (?, ?, ?, ?);\
                    INSERT INTO volunteer_information (userID, address, city, locality, country, postal, joined) VALUES(?, ?, ?, ?, ?, ?, ?);", 
                    [_volunteer.userID, _volunteer.firstName, _volunteer.lastName, _volunteer.email, 
                     _volunteer.userID, _volunteer.address, _volunteer.city, _volunteer.locality, _volunteer.country, _volunteer.postal, _month])
            .then(_ => resp.json({ userID: _volunteer.userID }))
            .catch(console.error);
    } else {
        await database
            .query("UPDATE users SET firstName=?, lastName=?, email=? WHERE userID=?;\
                    UPDATE volunteer_information SET address=?, city=?, locality=?, country=?, postal=? WHERE userID=?;", 
                    [_volunteer.firstName, _volunteer.lastName, _volunteer.email, _volunteer.userID,
                     _volunteer.address, _volunteer.city, _volunteer.locality, _volunteer.country, _volunteer.postal, _volunteer.userID])
            .then(_ => resp.json({ userID: _volunteer.userID }))
            .catch(console.error);
    }
}

/**
 * Removes a project from the database
 * @param { Request } req 
 * @param { Response } resp 
 * @author Camille Cutrone
 */
const removeProject = (req, resp) => {
    const _projectID = req.body.projectID;
    database
        .query("DELETE FROM payments WHERE projectID=?; DELETE FROM projects WHERE projectID=?;", [ _projectID, _projectID ])
        .then(_ => resp.json({ success: true }));
}
/**
 * Removes a volunteer from the database
 * @param { Request } req 
 * @param { Response } resp 
 * @author Camille Cutrone
 */
const removeVolunteer = (req, resp) => {
    const _userID = req.body.userID;
    database
        .query("DELETE FROM user_logins WHERE userID=?; DELETE FROM volunteer_information WHERE userID=?; DELETE FROM users WHERE userID=?;", [ _userID, _userID, _userID ])
        .then(_ => resp.json({ success: true }));
}

/**
 * Retrieves a Date object but sets all the values (except 
 * the year and the month) to 0 -- or 1 in the case of the 
 * date. 
 * @author Camille Cutrone
 */
const getBlankDate = () => {
    const _month = new Date();
    _month.setSeconds(0);
    _month.setMilliseconds(0);
    _month.setMinutes(0);
    _month.setHours(0);
    _month.setDate(1);
    return _month;
}

export default {
    monthsData, 
    volunteerData,
    updateProject,
    updateVolunteer,
    removeProject,
    removeVolunteer
};