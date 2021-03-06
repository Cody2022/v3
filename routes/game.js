const express=require('express');
const gameRouter=express.Router();
module.exports = gameRouter;

const { addCity, 
        findCity, 
        deleteCity,
        cityFindAllCities,
        updateCityTemperature,
        enter,
        guess,
        review,
        saveResult
    }=require('../model/game')

//----Play game-----------------

gameRouter.get('/enter', async(req,res)=>{
    let {geoJson, weatherJson}=await enter();
          
    geoString=`Welcome to the game "Guess-weather"! For your reference, the weather of ${geoJson.city} is currently ${weatherJson.weather[0].description}, and temperature is ${weatherJson.main.temp} Celsius.`;
    nextOperation=`\nBefore guessing, please check cities in the game box by: \ncurl "http://localhost:8000/game/checkbox"`

    res.send(geoString+nextOperation);
})

gameRouter.get('/checkbox', async (req,res)=>{
    let cityArray=await cityFindAllCities();
    let cities=[];
    for (city of cityArray){
        cities.push(city.name)
    }
    console.log(cities)
    nextOperation=`\nIf you want to add more cities into the box: \ncurl "http://localhost:8000/game/add?city={city}"
    \nIf you want to delete city/cities from the box:\ncurl "http://localhost:8000/game/delete?city={city}" `
    res.send(`There are ${cityArray.length} cities in the box. They are:\n${cities}`+nextOperation)
})

gameRouter.get('/delete', async(req, res)=>{
    let city=req.query.city;
    let cityFound=await deleteCity(city);
    if (cityFound.deletedCount===0){res.send(`${city} is not in the database`)}
    else{
        let cityArray=await cityFindAllCities();
        let cities=[];
        for (cityDb of cityArray){
            cities.push(cityDb.name)
        }
        console.log(cities);

    nextOperation=`You can set the accuracy and start guessing: \ncurl "http://localhost:8000/game/guess?accuracy={1}&city={Calgary}&temp={8}"`;        
    res.send(`${city} is deleted from the database. The cities in the box are:\n${cities}\n${nextOperation}`)}
})

gameRouter.get("/add", async (req, res)=>{
    let city=req.query.city;
    let addCityMessage=await addCity(city)
    let cityArray=await cityFindAllCities();
    let cities=[];
        for (cityDb of cityArray){
            cities.push(cityDb.name)
        }
     console.log(cities);
     nextOperation=`Set the accuracy and start guessing: \ncurl "http://localhost:8000/game/guess?accuracy={1}&city={Calgary}&temp={8}"`;
    res.send(`${city} has been added to the game box. The cities in the box are:\n${cities}\n${nextOperation}`);
    
}); 

gameRouter.get('/guess', async(req,res)=>{
    let city=req.query.city;
    let temp=Number(req.query.temp);
    let accuracy=Number(req.query.accuracy);

    let guessResult=await guess(accuracy, city, temp);
    res.send(guessResult)
})

gameRouter.get('/review', async (req,res)=>{
    let summary=await review();
    res.send(summary)
})

gameRouter.get('/save',async(req,res)=>{
    let player=req.query.player;
    let id=req.query.id;
    let savedUserDoc=await saveResult(player, id)
    res.send(`Hi ${savedUserDoc.user} with id ${savedUserDoc.id}. Your game results "scores: ${savedUserDoc.scores}" has been saved! Well done!`)
})

//----Cities operation
gameRouter.get('/find', async(req, res)=>{
    let city=req.query.city;
    let cityFound=await findCity(city);
    console.log("/find cityFound:",cityFound)
    if (cityFound===false){res.send(`${city} is not in the database`)}
    else{res.send(cityFound)}
})

gameRouter.get('/cityFindAll', async (req,res)=>{
    let cityArray=await cityFindAllCities();
    res.send(cityArray)
})

gameRouter.get('/update', async(req, res)=>{
    let city=req.query.city;
    let temperature=Number(req.query.temperature);
    console.log(temperature)
    let cityWithNewT=await updateCityTemperature(city, temperature);
    console.log("cityWithNewT",cityWithNewT)
    if (cityWithNewT===null){res.send(`Cannot update, ${city} is not in the database`)}
    else{res.send(cityWithNewT)};
})

