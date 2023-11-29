import React from "react";
 
function listApp() {
const Countries = [
{ name: "USA" },
{ name: "India" },
{ name: "Australia" },
{ name: "Spain" },
{ name: "France" },
{ name: "Japan" }
];
return (
    <div>
    <ul>
    {Countries.map((data, index) => (
    <li key={index}>{data.name}</li>
    ))}
    </ul>
    </div>
    );
    }

    export default listApp;
    