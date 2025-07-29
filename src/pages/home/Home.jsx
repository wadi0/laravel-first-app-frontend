import React from 'react';
import Collection from "../collection/Collection.jsx";
import "./home.scss";
import summercollection from "../../assets/collection/summer.jpg";
import wintercollection from "../../assets/collection/winter.jpg";
import specialcollection from "../../assets/collection/specialcollection.jpg";
import newcollection from "../../assets/collection/newcollection.jpg";
import otherscollection from "../../assets/collection/otherscollection.jpg";

const Home = () => {

    const collectionData = [
        {
            "id": 1,
            "name": "New Collection",
            "slug": "new-collection",
            "image": newcollection
        },
        {
            "id": 2,
            "name": "Summer Collection",
            "slug": "summer-collection",
            "image": summercollection
        },
        {
            "id": 3,
            "name": "Winter Collection",
            "slug": "winter-collection",
            "image": wintercollection
        },
        {
            "id": 4,
            "name": "Special Collection",
            "slug": "special-collection",
            "image": specialcollection
        },
        {
            "id": 5,
            "name": "Others Collection",
            "slug": "others-collection",
            "image": otherscollection
        },
    ]

    return (
        <div className="home-container">
            <div className="collections-wrapper">
                {collectionData.map((col) => (
                    <Collection
                        key={col.id}
                        name={col.name}
                        slug={col.slug}
                        img={col.image}
                    />
                ))}
            </div>
        </div>
    );
};

export default Home;
