import NewBill from "../containers/NewBill.js"

describe("Unit test", () => {

  describe("When the function handleChangeFile() of class NewBill is used", () => {

    describe("when I upload a file with the wrong format", () => {

      test("then it should return an error message ", () => {
        const wrongFormatFile = new File(["hello"], "hello.txt", { type: "document/txt" })
        const mockGetElementById = jest.fn()
        const mockErrorObj = {};
        mockGetElementById.mockReturnValue(mockErrorObj)
        const documentMock = {
          querySelector: (s) => {
            console.log('querySelector with ', s)
            if (s === 'input[data-testid="file"]') {
              
              return {
                files: [wrongFormatFile],
                addEventListener: () => true,
              }
            } else {
              return { addEventListener: () => true }
            }
          },
          getElementById: mockGetElementById
        }        
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: {},            
          localStorage: {}
        })


        objInstance.handleChangeFile({ preventDefault: () => true, target: {value: 'hello.txt'} })
        expect(mockGetElementById).toHaveBeenCalledWith('file-error')
        expect(mockErrorObj.textContent).toBeTruthy()
      })
    })

    describe("when I upload a file with the good format", () => {

      test("then it should save the user's email", () => {
        const mockGetElementById = jest.fn()
        
        mockGetElementById.mockReturnValue({})
        localStorage.setItem("user", '{"email" : "user@email.com"}')
        const createMock = jest.fn()
        const goodFormatFile = new File(['img'], 'image.png', { type: 'image/png' })
        const documentMock ={
          querySelector: (s) => {
            if (s === 'input[data-testid="file"]') {
              return {
                files: [goodFormatFile],
                addEventListener: () => true,
              }
            } else {
              return { addEventListener: () => true }
            }
          },
          getElementById: mockGetElementById
        }
        const storeMock ={
          bills: () => {
            return {
              create: createMock.mockResolvedValue({fileUrl: "fileURL", key: "key"}) 
            }
          }
        }
        const objInstance = new NewBill({
          document: documentMock,
          onNavigate: {},
          store: storeMock,
          localStorage: {}
        });

        objInstance.handleChangeFile({ 
          preventDefault: () => true ,
          target: {value: "image.png"}
        })
        console.log('createMock.mock.calls[0][0].data', createMock.mock.calls[0][0].data)
        expect(createMock.mock.calls[0][0].data.get("email")).toEqual("user@email.com")
      })
    })
  })
})