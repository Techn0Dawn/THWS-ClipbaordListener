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
    axios
      .get(`${backendUrl}/data/file/${filename}`, {
        responseType: "arraybuffer",
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);
        setImageData({ ...imageData, [entryId]: imageUrl });
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  };

  const downloadFiles = (files) => {
    files.map((file) =>
      axios
        .get(`${backendUrl}/data/file/${file.filename}`, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          const blob = new Blob([response.data], { type: `${file.mime_type}` });
          const fileUrl = URL.createObjectURL(blob);
          // Create an anchor element in memory
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = fileUrl;
          a.download = file.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch((error) => {
          console.error("Error fetching image:", error);
        })
    );
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
                {entry.actiontype === "text" && (
                  <div>
                    Captured Content:{" "}
                    <b style={{ color: "red", fontSize: "20px" }}>
                      {entry.content}
                    </b>
                  </div>
                )}
              </Item.Description>
              {entry.actiontype === "text" && (
                <Item.Extra>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div>{entry.files[0].filename}</div>
                      <div>Type: {entry.actiontype}</div>
                      {console.log(entry)}
                      <Button
                        onClick={() =>
                          getImage(entry.files[0].filename, entry.id)
                        }
                      >
                        Load
                      </Button>
                    </div>
                    {imageData[entry.id] && (
                      <Image
                        src={imageData[entry.id]}
                        alt="Captured Screen"
                        size="medium"
                        onClick={() => handleOpenModal(imageData[entry.id])}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </div>
                </Item.Extra>
              )}
              {entry.actiontype === "files" && (
                <Item.Extra>
                  <div>Type: {entry.actiontype}</div>
                  <div>
                    {entry.files.map((file) => (
                      <div key={file.id}>{file.filename}</div>
                    ))}
                  </div>
                  <Button onClick={() => downloadFiles(entry.files)}>
                    Download
                  </Button>
                </Item.Extra>
              )}
              <Button>
                Delete
              </Button>
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
            src={selectedImage}
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
