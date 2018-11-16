const monthsData = (_, resp) => {
    //TODO: get months from database
    resp.json([
        {
            name: "Jan",
            projects: [
                {
                    projectID: "asd1",
                    country: "Peru",
                    type: "Orphanage",
                    cost: 5000,
                    manager: "Gustavo"
                },
                {
                    projectID: "asd2",
                    country: "Haiti",
                    type: "Orphanage",
                    cost: 2670,
                    manager: "Pedro"
                }
            ]
        },
        { name: "Feb" },
        { name: "Mar" },
        { name: "Apr" },
        { name: "May" },
        { name: "June" },
        { name: "July" },
        { name: "Aug" },
        { name: "Sep" },
        { name: "Oct" },
        { name: "Nov" },
        { name: "Dec" },
    ])
};
const volunteerData = (_, resp) => {
    resp.json([
        {
            volunteerID: "volunteerID",
            name: "test_volunteer",
            address: "address",
            city: "city",
            locality: "locality",
            country: "country",
            postal: "postal"
        }
    ])
}
const updateProject = (_, resp) => {
    console.log('up')
    //TODO: save project
    resp.json({

    })
}
const updateVolunteer = (_, resp) => {
    console.log('uv')
    //TODO: save project
    resp.json({

    })
}
const removeProject = (_, resp) => {
    console.log('rp')
    //TODO: save project
    resp.json({

    })
}
const removeVolunteer = (_, resp) => {
    console.log('rv')
    //TODO: save project
    resp.json({

    })
}
export default {
    monthsData, 
    volunteerData,
    updateProject,
    updateVolunteer,
    removeProject,
    removeVolunteer
};