import React, { useEffect, useRef, useState } from "react";
import "./app.css";
import { Input, Card, Avatar, Tooltip, Button } from "antd";
import getUrls from "get-urls";
import styled from "styled-components";
import {
  PaperClipOutlined,
  ClearOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const { Meta } = Card;

const { Search } = Input;

const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  font-size: 1.6rem;
  margin-left: 0.5rem;
`;

const Container = styled.div`
  height: 100vh !important;
  width: 100%;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-inline: 10%;
  background-color: #f3f3f3af;
  overflow: none;
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: max(3.5%, 3rem);
`;

const Header = styled.div`
  height: 15vh;
  width: 100%;
  font-size: 1.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: FreeMono, monospace;
`;

const StyleSearch = styled(Search)`
  width: max(65%, 350px);
`;

const StyledButton = styled(Button)`
  margin-inline: 10px;
`;

const StyledCard = styled(Card)`
  margin: 1rem;
  cursor: pointer !important;

  & {
    position: relative;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  &:after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 5px;
    opacity: 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  &:hover {
    transform: scale(1.02);
  }

  &:hover:after {
    opacity: 1;
  }
`;

const CardContainer = styled.div`
  margin-top: 5vh;
  width: max(65%, 350px);
  height: 50vh;
  overflow: auto;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }

  ::-webkit-scrollbar {
    width: 5px;
    background-color: #f5f5f5;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #9e9e9e;
  }
`;

type MetaDeta = {
  url: string;
  title: string;
  favicon: string;
  description: string;
  image: string;
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metaData, setMetaData] = useState<MetaDeta[]>([]);
  const [value, setValue] = useState("");
  const [isError, setIsError] = useState(false);
  const [clipBoardUrls, setClipBoardUrls] = useState<string[]>([]);
  const ref = useRef(null);
  const [callApi, setCallApi] = useState<Date | null>(null);

  useEffect(() => {
    setFocus();
  }, []);

  useEffect(() => {
    if (!callApi) return;
    onSearch(value);
    setCallApi(null);
  }, [callApi, value]);

  const readClipBoard = () => {
    navigator.clipboard
      .readText()
      .then(async (text) => {
        const urls = getValidUrls(text);
        if (!!urls.length) {
          setClipBoardUrls(urls);
        }
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  const pasteUrls = () => {
    setValue(clipBoardUrls.toString());
    setCallApi(new Date());
  };

  const onSuccess = (response: any) => {
    const metaData = response.data;
    if (metaData.length) {
      setMetaData(metaData);
      setIsLoading(false);
      setFocus();
    } else {
      toast.error("Kinldy enter valid urls");
    }
  };

  const getValidUrls = (val: string) => {
    //@ts-ignore
    return [...getUrls(val).values()];
  };

  const instance = axios.create({
    baseURL: "https://link-preview-api-ts.herokuapp.com",
    timeout: 3000,
  });

  const onSearch = (val: string) => {
    if (!val) return;
    if (!getValidUrls(val).length) {
      toast.error("Kinldy enter valid urls");
      return;
    }
    setIsError(false);
    setIsLoading(true);
    instance
      .post("/preview-urls", {
        urls: value,
      })
      .then(onSuccess)
      .catch((error: any) => {
        console.log(error);
        toast.error("Some thing went wrong or try again with valid urls");
        setIsError(true);
        clearLinks();
      });
  };

  const clearLinks = () => {
    setIsLoading(false);
    setMetaData([]);
    setValue("");
  };

  const handleClick = (url: string) => {
    window.open(url);
  };

  const setFocus = () => {
    (ref.current as any)?.focus();
  };
  return (
    <>
      <Container>
        <Header>
          Link Previewer
          <Tooltip
            title={
              <>
                <div>
                  Type or Paste multiple links and get all preview cards at a
                  time
                </div>
                <div>
                  Use paste Urls button when you have valid urls in clipboard
                </div>
                <div>You can use this site in all screen sizes</div>
                <div>Click on the card to redirect to that Url</div>
              </>
            }
          >
            <StyledInfoCircleOutlined />
          </Tooltip>
        </Header>
        <StyleSearch
          placeholder="Paste / Type multiple links ...."
          enterButton="Get Metadata"
          size="large"
          onSearch={onSearch}
          onInput={(e) => setValue(e.currentTarget.value)}
          loading={isLoading}
          value={value}
          onFocus={readClipBoard}
          ref={ref}
        />
        {!!metaData.length && (
          <CardContainer>
            {metaData.map((value, index) => (
              <Tooltip key={index} title={value.url}>
                <StyledCard
                  onClick={() => handleClick(value.url)}
                  key={index}
                  style={{ width: 300 }}
                  cover={
                    <img
                      alt={value?.image}
                      src={
                        value?.image ||
                        "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"
                      }
                    />
                  }
                >
                  <Meta
                    key={index}
                    avatar={<Avatar key={index} src={value.favicon} />}
                    title={value.title}
                    description={value.description}
                  />
                </StyledCard>
              </Tooltip>
            ))}
          </CardContainer>
        )}
        {isError && (
          <div className="error">Some thing went wrong try again ...</div>
        )}
        {!isError && (
          <Actions>
            {!!clipBoardUrls.length && (
              <StyledButton
                onClick={pasteUrls}
                type="primary"
                icon={<PaperClipOutlined />}
                loading={isLoading}
              >
                Paste Urls
              </StyledButton>
            )}
            {!!metaData.length && (
              <StyledButton
                onClick={clearLinks}
                type="default"
                danger
                icon={<ClearOutlined />}
              >
                Clear Links
              </StyledButton>
            )}
          </Actions>
        )}
      </Container>
      <ToastContainer
        position="top-right"
        theme={"colored"}
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
