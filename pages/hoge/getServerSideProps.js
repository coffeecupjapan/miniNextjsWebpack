const getServerSideProps = () => {
    const props = {
        title: "test",
        num: 123
    }
    return props;
}

export default getServerSideProps;