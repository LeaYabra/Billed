/**
 * @jest-environment jsdom
 */

import { fireEvent,screen } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes";
import router from "../app/Router";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
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

  describe('When i am on new bill page, i do fill fields in correct format and i click submit button', () => {
    test('POST new bill', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      const storeMock = {
        bills: () => {
          return {
            update: function(bill) {
              return {
                then: function (fn) {
                  return { catch: () => {}}
                }
              }
            }
          };
        },
      };
      
      const newBillObjet = new NewBill({ document, onNavigate, store : storeMock, localStorage : window.localStorage });
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBillObjet.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      const titleBills = screen.queryByText("Mes notes de frais")
      expect(titleBills).toBeTruthy()
    })
  })
  
})

