import React, { useState } from "react";
import axios from "axios";
import { Button, Image, Item, Modal, Segment } from "semantic-ui-react";

export default function EntryList({ data }) {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageData, setImageData] = useState({});

  const handleOpenModal = (img) => {
    setSelectedImage(img);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_API;

  const getImage = (filename, entryId) => {
    axios.get(backendUrl + `/data/file/${filename}`).then((response) => {
      setImageData({ ...imageData, [entryId]: response.data });
    });
  };

  return (
    <Segment>
      <Item.Group divided>
        {data.map((entry) => (
          <Item key={entry.id}>
            <Item.Content>
              <Item.Header>
                {entry.username}@{entry.hostname}
              </Item.Header>
              <Item.Meta>{entry.timestamp}</Item.Meta>
              <Item.Description>
                <div>
                  Captured Content:{" "}
                  <b style={{ color: "red", fontSize: "20px" }}>
                    {entry.content}
                  </b>
                </div>
              </Item.Description>
              <Item.Extra>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div>{entry.filename}</div>
                    <Button onClick={() => getImage(entry.filename, entry.id)}>
                      Load
                    </Button>
                  </div>
                  {imageData[entry.id] && (
                    <Image
                      src={`data:image/png;base64,${imageData[entry.id]}`}
                      alt="Captured Screen"
                      size="medium"
                      onClick={() => handleOpenModal(imageData[entry.id])}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </div>
              </Item.Extra>
            </Item.Content>
          </Item>
        ))}
      </Item.Group>
      <Modal
        open={open}
        onClose={handleCloseModal}
        basic
        style={{ maxWidth: "75%" }}
        size="fullscreen"
      >
        <Modal.Content style={{ textAlign: "center" }}>
          <Image
            src={`data:image/png;base64,${selectedImage}`}
            alt="Captured Screen"
            size="massive"
            centered
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              width: "auto",
              height: "auto",
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleCloseModal}>Close</Button>
        </Modal.Actions>
      </Modal>
    </Segment>
  );
}
