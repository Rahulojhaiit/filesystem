const express = require("express");
var fileupload = require("express-fileupload");
const { PrismaClient } = require("@prisma/client");

const app = express();
app.use(fileupload());
const fs = require("fs");

const prisma = new PrismaClient();

app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));

const PORT = 3000;

//     Endpoint: POST /files/upload
// Input: File binary data, file name, metadata (if any)
// Output: A unique file identifier
// Metadata to Save: File name, createdAt timestamp, size, file type

//Sample input to get data from
//{
// test: {
//     name: 'fileInput.txt',
//     data: <Buffer 31 30 30 0a 36 32 37 33 20 36 32 37 33 20 38 37 32 36 20 38 37 32 36 20 35 38 38 31 20 35 38 38 31 20 31 39 35 33 20 31 39 35 33 20 38 33 30 35 20 38 ... 445 more bytes>,
//     size: 495,
//     encoding: '7bit',
//     tempFilePath: '',
//     truncated: false,
//     mimetype: 'text/plain',
//     md5: '28a6a414fb8f38f96cd98053c3c69e0e',
//     mv: [Function: mv]
//   }
// }
app.post("/files/upload", async (req, res) => {
  if (!req.files) {
    console.log("No File Uploaded");
    res.send("No File Uploaded");
  }

  const file = req.files.file;

  const filename = file.name;
  const data = file.data;
  const size = file.size;
  const filetype = file.mimetype;

  const fileObject = {
    filename,
    data,
    size,
    filetype,
  };

  filePath = __dirname + "/public/" + filename;
  console.log(filePath);

  fs.writeFile(filePath, data, (err) => {
    if (err) console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("The written has the following contents:");
      console.log(fs.readFileSync(filename, "utf8"));
    }
  });

  try {
    const newFile = await prisma.file.create({
      data: fileObject,
    });

    res.status(201).send({ fileId: newFile.id });
  } catch (error) {
    console.log(error);
    res.status(500).send("Faced some error in the server");
  }
});

// Read File API: Retrieve a specific file based on a unique identifier.
// Endpoint: GET /files/{fileId}
// Input: Unique file identifier
// Output: File binary data
app.get("/files/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const data = await prisma.file.findFirst({
    where: {
      id: fileId,
    },
  });

  filePath = __dirname + "/public/" + data.filename;
  console.log(filePath);

  if (data) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(data);
      res.status(200).send({ fileData: data });
    });
  } else res.status(404).send({ message: "File Not found" });
});

// Update File API: Update an existing file or its metadata.
// Endpoint: PUT /files/{fileId}
// Input: New file binary data or new metadata
// Output: Updated metadata or a success message

// This update method can handle one or multiple field updates at once, based on the Input.
app.put("/files/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const { newName, newData, newSize, newType } = req.body;

  const updateObject = {};
  if (newName) {
    updateObject.filename = newName;
  }
  if (newData) {
    updateObject.data = newData;
  }
  if (newSize) {
    updateObject.size = parseInt(newSize);
  }
  if (newType) {
    updateObject.filetype = newType;
  }

  try {
    const updatedData = await prisma.file.update({
      where: {
        id: fileId,
      },
      data: updateObject,
    });

    res
      .status(200)
      .json({ message: "Data has been updated", newData: updatedData });
  } catch (error) {
    console.log(error);
    res.status(500).send("Faced some error in the server");
  }
});

// Delete File API: Delete a specific file based on a unique identifier.
// Endpoint: DELETE /files/{fileId}
// Input: Unique file identifier
// Output: A success or failure message
app.delete("/files/:fileId", async (req, res) => {
  const fileID = req.params.fileId;

  try {
    const deletedFile = await prisma.file.delete({
      where: {
        id: fileID,
      },
    });
    if (deletedFile) {
      res.status(200).send("File has been deleted successfully!");
    }
  } catch (error) {
    res.status(404).send("File with the given Id does not exist");
  }
});

// List Files API: List all available files and their metadata.
// Endpoint: GET /files
// Input: None
// Output: A list of file metadata objects, including file IDs, names, createdAt timestamps, etc.
app.get("/files", async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      select: {
        createdAt: true,
        filename: true,
        filetype: true,
        id: true,
        size: true,
      },
    });

    res.status(200).json({ files: files });
  } catch (error) {
    console.log(error);
    res.status(500).send("Faced some error in the server");
  }
});

app.get("/", (req, res) => {
  return res.status(200).send("Hello World");
});

app.listen(PORT, () => {
  console.log("listening to port ", PORT);
});
