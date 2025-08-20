import "../../Components/LT Header/LearningHeader.css"

function LearningHeader({header}){
    return(
    <>
    <div className="Header-container">
        <h5>{header}</h5>
    </div>
    </>
    );
}

export default LearningHeader;