import React from 'react';
import "./collection.scss"
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";

const Collection = ({name, slug, img}) => {

    const handleClick = () => {
        AxiosServices.get(ApiUrlServices.TITLE_COLLECTION(slug))
            .then((res) => {
                console.log("API response:", res);
            })
            .catch((err) => {
                console.error("API error:", err);
            });
    };

    return (
        <div
            className="collection-card"
            style={{backgroundImage: `url(${img})`}}
            onClick={handleClick}
        >
            <div className="collection-overlay">
                <h3 className="collection-name">{name}</h3>
                {/*<p className="collection-slug">{slug}</p>*/}
                {/*<button className="collection-button">View Collection</button>*/}
            </div>
        </div>
    );
};

export default Collection;
