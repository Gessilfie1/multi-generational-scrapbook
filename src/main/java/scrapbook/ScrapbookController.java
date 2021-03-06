package scrapbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.Optional;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class ScrapbookController {

	@Resource
	KidRepository kidRepo;

	@Resource
	ImageRepository imageRepo;

	@Resource
	CommentRepository commentRepo;
	
	@Resource
	HeartRepository heartRepo;
	
	@RequestMapping("/kid")
	public String findOneKid(@RequestParam(value = "id") long id, Model model) throws KidNotFoundException {
		Optional<Kid> kid = kidRepo.findById(id);

		if (kid.isPresent()) {
			model.addAttribute("kids", kid.get());
			return "kid";
		}
		throw new KidNotFoundException();
	}

	@RequestMapping("/kids")
	public String findAllKids(Model model) {
		model.addAttribute("kids", kidRepo.findAll());
		return ("kids");
	}

	@RequestMapping("/image")
	public String findOneImage(@RequestParam(value = "id") long id, Model model) throws ImageNotFoundException {
		Optional<Image> image = imageRepo.findById(id);

		if (image.isPresent()) {
			model.addAttribute("images", image.get());
			return "image";
		}
		throw new ImageNotFoundException();

	}

	@RequestMapping("/images")
	public String findAllImages(Model model) {
		model.addAttribute("images", imageRepo.findAll());
		return ("images");
	}

	@RequestMapping("/comment")
	public String findOneComment(@RequestParam(value = "id") long id, Model model) throws CommentNotFoundException {
		Optional<Comment> comment = commentRepo.findById(id);

		if (comment.isPresent()) {
			model.addAttribute("comments", comment.get());
			return "comment";
		}
		throw new CommentNotFoundException();
	}

	@RequestMapping("/comments")
	public String findAllComments(Model model) {
		model.addAttribute("comments", commentRepo.findAll());
		return ("comments");
	}

	@RequestMapping("/add-new-channel")
	public String addNewChannel() {
		return "newkid";
	}

	@RequestMapping("/add-image")
	public String addImage(@RequestParam(value = "id") long id, Model model) throws KidNotFoundException {
		Optional<Kid> kid = kidRepo.findById(id);

		if (kid.isPresent()) {
			model.addAttribute("kids", kid.get());
			return "add-image";
		}
		throw new KidNotFoundException();
	}

	@RequestMapping("/edit-channel")
	public String editChannel(@RequestParam(value = "id") long id, Model model) throws KidNotFoundException {
		Optional<Kid> kid = kidRepo.findById(id);

		if (kid.isPresent()) {
			model.addAttribute("kids", kid.get());
			return "edit-channel";
		}
		throw new KidNotFoundException();
	}

	@RequestMapping("/add-status")
	public String addStatus(@RequestParam(value = "id") long id, Model model) throws KidNotFoundException {
		Optional<Kid> kid = kidRepo.findById(id);

		if (kid.isPresent()) {
			model.addAttribute("kids", kid.get());
			return "add-status";
		}
		throw new KidNotFoundException();
	}

	// Status Update Demo Mapping
	@RequestMapping("/status-update-demo")
	public String sendStatusUpdateToServer() {
		return "status-update-demo";
	}

	// Status Update Form
	@RequestMapping("/add-status-update")
	public String addStatusUpdateForm(@RequestParam(value = "id") long id, Model model) throws KidNotFoundException {
		Optional<Kid> kid = kidRepo.findById(id);

		if (kid.isPresent()) {
			model.addAttribute("kids", kid.get());
			return "add-status-update";
		}
		throw new KidNotFoundException();
	}

	private String getUploadDirectory() {
		// Determine where uploads should be saved
		String userHomeDirectory = System.getProperty("user.home");
		String uploadDirectory = Paths.get(userHomeDirectory, "scrapbook-uploads").toString();

		// Create if needed
		new File(uploadDirectory).mkdirs();

		// Return path
		return uploadDirectory;
	}

	@PostMapping("/uploadStatus")
	public String uploadStatus(@RequestParam("caption") String caption, @RequestParam("kidId") long kidId,
			@RequestParam("file") MultipartFile imageFile, Model model) throws IOException {

		// Upload image - stream uploaded data to a temporary file
		String fileName = "Status-" + new SimpleDateFormat("ddMMyy-hhmmss-SSS").format(new Date()) + ".blb";

		// Transfer file to its permanent location
		String uploadDirectory = getUploadDirectory();
		File fileUpload = new File(uploadDirectory, fileName);
		imageFile.transferTo(fileUpload);

		// Add image to imageRepo
		Optional<Kid> kidOptional = kidRepo.findById(kidId);
		Kid kidForImage = kidOptional.get();

		String imageUrl = "/uploadedimage/" + fileName;
		Image image = imageRepo.save(
				new Image(imageUrl, caption, new SimpleDateFormat("MMMM d, yyyy").format(new Date()), kidForImage));
		
		return "redirect:/kid?id=" + kidId;
	}
	
	@PostMapping("/uploadImage")
	public String uploadImage(@RequestParam("caption") String caption, @RequestParam("kidId") long kidId,
			@RequestParam("file") MultipartFile imageFile, Model model) throws IOException {

		// Upload image - stream uploaded data to a temporary file
		String fileName = imageFile.getOriginalFilename();
		if ("".equalsIgnoreCase(fileName)) {
			return "redirect:/kid?id=" + kidId;
		}

		// Transfer file to its permanent location
		String uploadDirectory = getUploadDirectory();
		File fileUpload = new File(uploadDirectory, fileName);
		imageFile.transferTo(fileUpload);

		// Add image to imageRepo
		Optional<Kid> kidOptional = kidRepo.findById(kidId);
		Kid kidForImage = kidOptional.get();

		String imageUrl = "/uploadedimage/" + fileName;
		Image image = imageRepo.save(
				new Image(imageUrl, caption, new SimpleDateFormat("MMMM d, yyyy").format(new Date()), kidForImage));

		model.addAttribute("flashMessage", "File uploaded successfully.");

		return "redirect:/kid?id=" + kidId;
	}

	@GetMapping("/uploadedimage/{file}")
	public void serveImage(HttpServletRequest request, HttpServletResponse response,
			@PathVariable("file") String fileName) throws Exception {

		// Determine path of requested file
		Path filePath = Paths.get(getUploadDirectory(), fileName);
		String filePathString = filePath.toString();
		File requestedFile = new File(filePathString);

		// Ensure requested item exists and is a file
		if (!requestedFile.exists() || !requestedFile.isFile()) {
			throw new Exception();
		}

		// Determine and set correct content type of response
		String fileContentType = Files.probeContentType(filePath);
		response.setContentType(fileContentType);

		// Serve file by streaming it directly to the response
		InputStream in = new FileInputStream(filePathString);
		IOUtils.copy(in, response.getOutputStream());

	}

	@PostMapping("/uploadNewKid")
	public String uploadNewKid(@RequestParam("kidName") String kidName, @RequestParam("radio") int colorNum,
			@RequestParam("file") MultipartFile imageFile, Model model) throws IOException {

		// Upload image - stream uploaded data to a temporary file
		String fileName = imageFile.getOriginalFilename();
		if ("".equalsIgnoreCase(fileName) || "".equalsIgnoreCase(kidName)) {
			return "redirect:/kids";
		}

		// Transfer file to its permanent location
		String uploadDirectory = getUploadDirectory();
		File fileUpload = new File(uploadDirectory, fileName);
		imageFile.transferTo(fileUpload);

		// Add kid to kidRepo
		String portraitUrl = "/uploadedimage/" + fileName;
		Kid kid = kidRepo.save(new Kid(kidName, portraitUrl, colorNum, true));

		return "redirect:/kids";
	}
		
	@RequestMapping("/delete-kid")
	public String deleteOneKidById(@RequestParam("id") long kidId) {
							
		Optional<Kid> kidOptional = kidRepo.findById(kidId);
		Kid kid = kidOptional.get();
					
		Collection<Image> images = kid.getImages();
		
		for (Image image: images) {
			
			Collection<Comment> comments = image.getComments();
			for(Comment comment : comments) {
				commentRepo.delete(comment);
			}
			
			Collection<Heart> hearts = image.getHearts();
			for(Heart heart : hearts) {
				heartRepo.delete(heart);
			}
			
			imageRepo.delete(image);
		}
		
		kidRepo.delete(kid);
	
		return "redirect:/kids";
	}

	@PostMapping("/editKid")
	public String editKid(
			@RequestParam("kidId") long kidId,
			@RequestParam("kidName") String kidName, 
			@RequestParam("radio") int colorNum,
			@RequestParam("file") MultipartFile imageFile, Model model) throws IOException {
		
		Optional<Kid> kidOptional = kidRepo.findById(kidId);
		Kid kidToEdit = kidOptional.get();
		
		boolean setSomething = false;
		
		if (!kidName.equals("") && !kidName.equals(kidToEdit.getName())) {
			kidToEdit.setName(kidName);
			setSomething = true;
		}
		
		if (colorNum != kidToEdit.getColorNum()) {
			kidToEdit.setColorNum(colorNum);
			setSomething = true;
		}
		
		String fileName = imageFile.getOriginalFilename();
		if (!"".equalsIgnoreCase(fileName)) {

			String uploadDirectory = getUploadDirectory();
			File fileUpload = new File(uploadDirectory, fileName);
			imageFile.transferTo(fileUpload);

			String portraitUrl = "/uploadedimage/" + fileName;
			kidToEdit.setPortraitUrl(portraitUrl);
			setSomething = true;
		}
		
		if (setSomething) {
			kidRepo.save(kidToEdit);
		}
		
		return "redirect:/kid?id=" + kidId;
	}
	
}
