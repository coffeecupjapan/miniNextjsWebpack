import axios from "axios"

const getServerSideProps = async () => {
    try {
        const result = await axios({method: "get", url:"https://jsonplaceholder.typicode.com/todos/1"});
        const props = {
            title: result.data.title,
            num: result.data.userId
        }
        return props;
    } catch(e) {
        return {title: "", num: 0};
    }
}

export default getServerSideProps;