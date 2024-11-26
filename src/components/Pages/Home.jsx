import { useNavigate } from "react-router-dom";
const Home = ()=>{
    const navigate = useNavigate();
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target)
        const formValues = {
            name: formData.get('invite_link')
        }
        const inviteCode = formValues.name
        navigate('videocall', {
            state:{RoomId:inviteCode}
        });
    }

    return (
        <>
        <main id="lobby-container">
        <div id="form-container">
            <div id="form__container__header">
                <p>👋 Create OR Join a Room</p>
            </div>

            <div id="form__content__wrapper">
                <form id="join-form" onSubmit={handleSubmit}>
                    <input type="text" name="invite_link" required/>
                    <input type="submit" value="Join Room"/>
                </form>
            </div>
        </div>
    </main>

        </>
    )
}
export default Home;