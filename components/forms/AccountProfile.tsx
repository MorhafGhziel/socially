"use client";

import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import * as z from "zod";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState<string>(
    user?.image ? user.image.split("/").pop() || "" : ""
  );
  const { startUpload } = useUploadThing("media");
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image || "",
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles([file]);
      setFileName(file.name);

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof UserValidation>) {
    try {
      const blob = values.profile_photo;
      const hasImageChanged = isBase64Image(blob);
      let imageUrl = values.profile_photo;

      if (hasImageChanged) {
        const imgRes = await startUpload(files);
        if (imgRes && imgRes[0].url) {
          imageUrl = imgRes[0].url;
        }
      }

      await updateUser({
        userId: user.id,
        username: values.username,
        name: values.name,
        bio: values.bio || "",
        image: imageUrl,
        path: pathname,
      });

      if (pathname === "/profile/edit") {
        router.back();
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <div className="relative h-24 w-24 object-cover">
                    <Image
                      src={field.value}
                      alt="profile photo"
                      fill
                      priority
                      className="rounded-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="relative h-24 w-24 object-cover">
                    <Image
                      src="/assets/profile.svg"
                      alt="profile photo"
                      fill
                      className="rounded-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  className="account-form_image-input"
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="account-form_input no-focus"
                />
              </FormControl>
              {fieldState.error && (
                <p className="text-red-500">{fieldState.error.message}</p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-light-2">Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  className="account-form_input no-focus"
                />
              </FormControl>
              {fieldState.error && (
                <p className="text-red-500">{fieldState.error.message}</p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Bio (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  {...field}
                  className="account-form_input no-focus"
                />
              </FormControl>
              {fieldState.error && (
                <p className="text-red-500">{fieldState.error.message}</p>
              )}
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default AccountProfile;
