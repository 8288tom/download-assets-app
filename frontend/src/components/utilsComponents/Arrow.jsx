import "../../css/Arrow.css"

export default function Arrow({onClick}){
    return(
    <div className="arrow" onClick={onClick}>
        <div className="arrow-top"></div>
        <div className="arrow-bottom"></div>
    </div>
    )
}